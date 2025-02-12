use futures::{SinkExt, StreamExt};
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;
use tokio_tungstenite::tungstenite::protocol::{CloseFrame, Message};
use url::Url;

#[tokio::main]
async fn main() {
    let _url = Url::parse("ws://127.0.0.1:8080").unwrap();
    let (mut ws_stream, _) = connect_async("ws://127.0.0.1:8080")
        .await
        .expect("Failed to connect");

    println!("WebSocket connected");

    // ws_stream
    //     .send(Message::Text("Hello, WebSocket!".into()))
    //     .await
    //     .expect("Failed to send message");

    for _i in 0..3 {
        ws_stream.send(Message::Ping("ping".into())).await.unwrap();
    }
    // let (w, r) = ws_stream.split();
    ws_stream
        .close(Some(CloseFrame {
            code: CloseCode::Normal,
            reason: "test".into(),
        }))
        .await
        .unwrap();

    while let Some(msg) = ws_stream.next().await {
        let msg = msg.expect("Failed to read message");
        println!("Received: {:?}", msg);
    }
}
