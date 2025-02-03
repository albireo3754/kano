use std::{collections::BTreeMap, sync::Arc};

use anyhow::{anyhow, Result};
use futures::{
    stream::{SplitSink, SplitStream},
    SinkExt, StreamExt,
};
use tokio::{
    net::TcpStream,
    sync::mpsc::{UnboundedReceiver, UnboundedSender},
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

pub struct Clients {
    clients: BTreeMap<ClientId, Arc<Client>>,
}

#[derive(Clone)]
pub struct Client {
    id: ClientId,
    ws_sender: UnboundedSender<Message>,
}

impl Client {
    pub fn new(id: ClientId, ws_sender: UnboundedSender<Message>) -> Self {
        Client { id, ws_sender }
    }

    pub async fn send_message(&self, msg: Message) {
        self.ws_sender.send(msg).unwrap();
    }
}

pub struct ClientWebSocketHandler {
    ws_reader: SplitStream<WebSocketStream<TcpStream>>,
    ws_writer: SplitSink<WebSocketStream<TcpStream>, Message>,
    client: Arc<Client>,
    server_receiver: UnboundedReceiver<Message>,
}

impl ClientWebSocketHandler {
    pub fn new(
        stream: WebSocketStream<TcpStream>,
        client: Arc<Client>,
        receiver: UnboundedReceiver<Message>,
    ) -> Self {
        let (ws_writer, ws_reader) = stream.split();
        ClientWebSocketHandler {
            ws_reader,
            ws_writer,
            client,
            server_receiver: receiver,
        }
    }

    pub async fn run_loop(mut self) {
        info!("ClientWebSocketHandler::run_loop");
        loop {
            let result = tokio::select! {
                Some(recv) = self.server_receiver.recv() => {
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

            if let Err(e) = result {
                error!("Error: {}", e);
            }
        }
    }

    async fn _handle_message_frame(&mut self, msg: Message) -> Result<()> {
        debug!("Received message: {:?}", msg);
        match msg {
            Message::Text(_) => self.ws_writer.send(msg).await.map_err(|e| e.into()),
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
