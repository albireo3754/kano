use std::{collections::BTreeMap, sync::Arc};

use anyhow::{anyhow, Result};
use futures::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt,
};
use tokio::{
    net::TcpStream,
    sync::{
        mpsc::{UnboundedReceiver, UnboundedSender},
        oneshot::Sender,
        Mutex,
    },
};
use tokio_tungstenite::{tungstenite::Message, WebSocketStream};
use tracing::{debug, error, info};

// Client의 메타포 이기 때문에 Client 의 관점에서 함수를 구현한다.
// - send_message는 Client -> Server지 Server에서 Client의 send_message를 구현하는게 아님

#[derive(Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct ClientId {
    pub id: String,
}

impl ClientId {
    pub fn new(id: &str) -> Self {
        ClientId { id: id.to_string() }
    }
}

#[derive(Clone)]
pub struct UserWebsocketImpl {
    _id: ClientId,
    ws_sender: UnboundedSender<Message>,
    request_map: Arc<Mutex<BTreeMap<String, Sender<String>>>>,
}

impl UserWebsocketImpl {
    pub fn new(id: ClientId, ws_sender: UnboundedSender<Message>) -> Self {
        UserWebsocketImpl {
            _id: id,
            ws_sender,
            request_map: Arc::new(Mutex::new(BTreeMap::new())),
        }
    }

    pub async fn send_message(&self, msg: Message) {
        let _result = self.ws_sender.send(msg);
    }

    pub async fn close(&self) {
        let _result = self.ws_sender.closed().await;
        self.request_map.lock().await.clear();
    }
}

pub struct ClientWebSocketHandler {
    ws_reader: SplitStream<WebSocketStream<TcpStream>>,
    ws_writer: SplitSink<WebSocketStream<TcpStream>, Message>,
    _client: Arc<UserWebsocketImpl>,
    server_to_ws_receiver: UnboundedReceiver<Message>,
    ws_to_server_sender: UnboundedSender<Message>,
}

impl ClientWebSocketHandler {
    pub fn new(
        ws_reader: SplitStream<WebSocketStream<TcpStream>>,
        ws_writer: SplitSink<WebSocketStream<TcpStream>, Message>,
        client: Arc<UserWebsocketImpl>,
        server_to_ws_receiver: UnboundedReceiver<Message>,
        ws_to_server_sender: UnboundedSender<Message>,
    ) -> Self {
        ClientWebSocketHandler {
            ws_reader,
            ws_writer,
            _client: client,
            server_to_ws_receiver,
            ws_to_server_sender,
        }
    }

    pub async fn run_loop(mut self) {
        info!("ClientWebSocketHandler::run_loop");
        loop {
            let result = tokio::select! {
                Some(recv) = self.server_to_ws_receiver.recv() => {
                    self.ws_writer.send(recv).await.map_err(|e| e.into())
                }
                Some(msg) = self.ws_reader.next() => {
                    match msg {
                        Ok(msg) => self._handle_message_frame(msg).await,

                        Err(err) => {
                            Err(anyhow!("Error: {:?}", err))
                        }
                    }
                }
            };

            // 에러 상황은 이미 write stream이 닫혔다. 그래서 ws_receiver에 데이터가 남아 있더라도 그냥 명시적으로 커넥션을 닫고, 데이터를 날린다.
            // 이 상황에서 데이터 유실이 발생하기 때문에 인식해야할 필요는 있다.
            if let Err(e) = result {
                error!("Error: {}", e);
                self.server_to_ws_receiver.close();
                return;
            }
        }
    }

    async fn _handle_message_frame(&mut self, msg: Message) -> Result<()> {
        debug!("Received message: {:?}", msg);
        match msg {
            Message::Text(_) => self.ws_to_server_sender.send(msg).map_err(|e| e.into()),
            Message::Ping(p) => self
                .ws_writer
                .send(Message::Pong(p))
                .await
                .map_err(|e| e.into()),
            Message::Close(_) => Ok(()),
            Message::Binary(_bytes) => Ok(()),
            Message::Pong(_bytes) => Ok(()),
            Message::Frame(_frame) => Ok(()),
        }
    }
}
