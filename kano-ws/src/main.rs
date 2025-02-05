mod client;
mod tracing;

use std::sync::Arc;

use ::tracing::error;
use client::ClientWebSocketHandler;
use futures::StreamExt;
use tokio::net::TcpListener;
use tokio_tungstenite::{accept_async, tungstenite::http::header::SEC_WEBSOCKET_EXTENSIONS};
use tracing::init_tracing;

#[tokio::main]
async fn main() {
    init_tracing();

    tokio::select! {
        _ = run_websocket_server() => {
            error!("WebSocket server binding failed");
        },
    }
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

            let (ws_to_server_sender, ws_to_server_receiver) =
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

            client_handler.run_loop().await;
        });
    }
}
