import { CreateMessageDTO, Message } from 'kano-js-share';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid';

interface MessagesState {
  messages: IMessage[]
  sendMessage: (message: IMessage[]) => void

  ws: WebSocket | null;
  initializeWebSocket: () => void;
}

interface WebsocketState {
}

export const useStore = create<AppState>((set) => ({
  messages: [],
  sendMessage: (messages) => {
    set((state) => {
      console.log("State.ws", state.ws?.readyState);

      messages.forEach((message) => {
        console.log("Sending message", message);
        let createMessageDTO: CreateMessageDTO = {
          text: message.text,
          conversationId: "1",
          requestId: uuidv4(),
        }
        let json = JSON.stringify(createMessageDTO);
        state.ws?.send(json);
      });
      return {};
      // return ({
      //   messages: GiftedChat.append(state.messages, message),
      // });
    })
  },

  ws: null,
  initializeWebSocket: () => {
    set((state) => {
      const ws = new WebSocket('ws://localhost:8080');

      ws.onopen = () => {
        console.log('WebSocket connection opened');
      }

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        const message: Message = JSON.parse(event.data);

        const imessage = messageToIMessage(message);
        set((state) => ({
          messages: GiftedChat.append(state.messages, [imessage]),
        }));
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error', error);
      };

      return ({
        ws,
      });
    })
  },
}));

type AppState = MessagesState & WebsocketState;
//  & UserState & TodoState;
export default AppState;

function messageToIMessage(message: Message): IMessage {
  return {
    _id: message.id,
    text: message.text,
    createdAt: bigIntToDate(message.createdAt),
    user: {
      _id: message.userId,
      name: "unknown",
      avatar: "null",
    },
  };
}


function bigIntToDate(bigint: BigInt): Date {
  return new Date(Number(bigint));
}
