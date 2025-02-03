mod client;
mod tracing;

use std::sync::Arc;

use ::tracing::error;
use client::ClientWebSocketHandler;
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
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
            let ws_stream = accept_async(stream)
                .await
                .expect("Error during the websocket handshake");

            let (client_sender, client_receiver) = tokio::sync::mpsc::unbounded_channel();
            let client_id = client::ClientId::new("1");
            let client = client::Client::new(client_id, client_sender);
            let client = Arc::new(client);
            let client_handler =
                ClientWebSocketHandler::new(ws_stream, client.clone(), client_receiver);

            client_handler.run_loop().await;
        });
    }
}
