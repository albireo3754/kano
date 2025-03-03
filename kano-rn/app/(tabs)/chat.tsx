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
      <Text style={{ flex: 0, }}>{props.currentMessage.createdAt.toLocaleString()}</Text>
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
            <Message {...props} containerStyle={{
              left: {
                // backgroundColor: '#fff',
                margin: 0,
                // flexShrink: 1,
                // flexGrow: 1,
                // flexBasis: 'auto',
              },
              right: {
                // backgroundColor: '#000',
                margin: 0,
                // flexShrink: 1,
                // flexGrow: 1,
                // flexBasis: 'auto',
              }
            }}

            ></Message>
          )
        }
      }
      renderBubble={props => {
        return (
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end', margin: 0, flexShrink: 0, flexGrow: 0 }}>

            {props.position == 'right' ? renderTime(props) : null}
            <Bubble
              {...props}

              containerStyle={{
                left: {
                  // backgroundColor: '#fff',
                  margin: 0,
                  flex: 0,
                  // marginLeft: 0,
                  // marginRight: 0,
                  // flexShrink: 1,
                  // flexBasis: 'auto',
                },
                right: {
                  // backgroundColor: '#000',
                  margin: 0,
                  flex: 0,
                  // marginLeft: 0,
                  // marginRight: 0,
                  // flexShrink: 1,

                  // flexBasis: 'auto',
                }
              }}

              textStyle={{
                left: {
                  // backgroundColor: '#333',
                  margin: 0,
                  padding: 0,
                  // flexBasis: 'auto',
                  // flexShrink: 1,
                  // marginLeft: 0,
                  // marginRight: 0,
                  // flex: 0,
                },
                right: {
                  // backgroundColor: '#777',
                  margin: 0,
                  padding: 0,
                  // flex: 0,
                  // marginLeft: 0,
                  // marginRight: 0,
                  // flexBasis: 'auto',
                  // flexShrink: 1,
                }
              }}



              wrapperStyle={{
                left: {
                  // backgroundColor: '#fff',
                  // flexShrink: 1,

                  // flexBasis: 'auto',
                  marginLeft: 0,
                  marginRight: 0,
                },
                right: {
                  // backgroundColor: '#000',
                  // flexShrink: 1,

                  // flexBasis: 'auto',
                  marginLeft: 0,
                  marginRight: 0,
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
        _id: 1,
      }}
    />
  )
}