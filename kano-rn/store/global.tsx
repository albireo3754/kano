import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

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
  sendMessage: (message) => {
    set((state) => {
      console.log("State.ws", state.ws?.readyState);
      state.ws?.send(JSON.stringify(message));
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
        const message: IMessage[] = JSON.parse(event.data);
        set((state) => ({
          messages: GiftedChat.append(state.messages, message),
        }));
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error', error);
      };

      return ({
        ws: ws,
      });
    })
  },
}));

type AppState = MessagesState & WebsocketState;
//  & UserState & TodoState;
export default AppState;