mod client;
mod tracing;

use std::sync::Arc;

use ::tracing::error;
use client::ClientWebSocketHandler;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tracing::init_tracing;
use uuid::Uuid;

#[tokio::main]
async fn main() {
    init_tracing();

    tokio::select! {
        _ = run_websocket_server() => {
            error!("WebSocket server binding failed");
        },
    }
}

// IMessage {
//     _id: string | number;
//     text: string;
//     createdAt: Date | number;
//     user: User;
//     image?: string;
//     video?: string;
//     audio?: string;
//     system?: boolean;
//     sent?: boolean;
//     received?: boolean;
//     pending?: boolean;
//     quickReplies?: QuickReplies;
// }
// User {
//     _id: string | number;
//     name?: string;
//     avatar?: string | number | renderFunction;
// }

#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    _id: i64,
    name: Option<String>,
    avatar: Option<String>,
}

// export interface QuickReplies {
//     type: 'radio' | 'checkbox';
//     values: Reply[];
//     keepIt?: boolean;
// }

#[derive(Debug, Clone, Serialize, Deserialize)]
struct IMessage {
    _id: String,
    text: String,
    #[serde(rename = "createdAt")]
    created_at: String,
    user: User,
    image: Option<String>,
    video: Option<String>,
    audio: Option<String>,
    system: Option<bool>,
    sent: Option<bool>,
    received: Option<bool>,
    pending: Option<bool>,
    // quickReplies: Option<QuickReplies>,
}

async fn run_websocket_server() {
    // Bind the TCP listener to the address
    let addr = "127.0.0.1:8080";
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");

    println!("Listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(async move {
            let ws_stream = accept_async(stream).await;
            let ws_stream = if let Err(e) = ws_stream {
                error!("Error during WebSocket handshake: {}", e);
                return;
            } else {
                ws_stream.unwrap()
            };

            let (ws_sender, ws_receiver) = ws_stream.split();

            let (ws_to_server_sender, mut ws_to_server_receiver) =
                tokio::sync::mpsc::unbounded_channel();
            let (server_to_ws_sender, server_to_ws_receiver) =
                tokio::sync::mpsc::unbounded_channel();
            let client_id = client::ClientId::new("1");
            let client = client::Client::new(client_id, server_to_ws_sender);
            let client = Arc::new(client);
            let client_handler = ClientWebSocketHandler::new(
                ws_receiver,
                ws_sender,
                client.clone(),
                server_to_ws_receiver,
                ws_to_server_sender,
            );

            let handle = async {
                while let Some(msg) = ws_to_server_receiver.recv().await {
                    match msg {
                        Message::Text(ref text) => {
                            let text = text.to_string();
                            client.send_message(msg).await;

                            let mut values = serde_json::from_str::<Vec<IMessage>>(&text).unwrap();

                            for value in values.iter_mut() {
                                value._id = Uuid::new_v4().to_string();
                                value.user._id = 2;
                            }

                            let text = serde_json::to_string(&values).unwrap();

                            client.send_message(Message::Text(text.into())).await;

                            // println!("Received text: {}", text);
                        }
                        Message::Binary(bin) => {
                            println!("Received binary: {:?}", bin);
                        }
                        _ => {
                            println!("Received other: {:?}", msg);
                        }
                    }
                }
            };

            tokio::join!(handle, client_handler.run_loop());
        });
    }
}
