import React, { useState, useCallback, useEffect } from 'react'
import { Bubble, GiftedChat, IMessage, Message } from 'react-native-gifted-chat'
import { useStore } from '@/store/global'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'

export default function ChatScreen() {
  const messages = useStore(state => state.messages)
  const sendMessage = useStore(state => state.sendMessage)
  const [text, setText] = useState('')
  // const [messages, setMessages] = useState<IMessage[]>([])

  const renderTime = (props: any) => {
    return (
      <Text style={{ marginLeft: 'auto' }}>{props.currentMessage.createdAt.toLocaleString()}</Text>
    )
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => sendMessage(messages)}
      text={text}
      // renderSend={renderInputToolbar}
      renderMessage={
        (props) => {
          return (
            <Message {...props}></Message>
          )
        }
      }
      renderBubble={props => {
        return (
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', margin: 0 }}>

            {props.position == 'right' ? renderTime(props) : null}
            <Bubble
              {...props}

              wrapperStyle={{
                left: {
                  backgroundColor: '#fff',
                },
                right: {
                  backgroundColor: '#000',
                },
              }}
              renderTime={() => null}
            />
            {props.position == 'left' ? renderTime(props) : null}
          </View>
        )
      }}
      onInputTextChanged={setText}
      bottomOffset={200}
      user={{
        _id: "1",
      }}
    />
  )
}