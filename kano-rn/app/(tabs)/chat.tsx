import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { useStore } from '@/store/global'

export default function Example() {
  const messages = useStore(state => state.messages)
  const sendMessage = useStore(state => state.sendMessage)
  const [text, setText] = useState('')
  // const [messages, setMessages] = useState<IMessage[]>([])

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => sendMessage(messages)}
      text={text}
      // renderSend={renderInputToolbar}
      onInputTextChanged={setText}
      bottomOffset={200}
      user={{
        _id: 1,
      }}
    />
  )
}