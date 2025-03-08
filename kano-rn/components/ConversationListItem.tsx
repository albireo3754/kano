import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import React from 'react';
import FastImage from 'react-native-fast-image';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export interface ConversationListItemViewModel {
  name: string;
  message: string;
  time: string;
  avatar?: string;
}

export function ConversationListItem(props: ThemedViewProps & ConversationListItemViewModel) {
  // const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View style={styles.container}>
      {/* <FastImage
        style={styles.avatar}
        source={{
          uri: 'https://unsplash.it/400/400?image=1',
          // headers: { Authorization: 'someAuthToken' },
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.contain}
      /> */}
      <View style={styles.messageContainer}>
        <View style={styles.header}>
          <Text style={styles.name}>{props.name}</Text>
          <Text style={styles.time}>{props.time}</Text>
        </View>
        <Text style={styles.message}>{props.message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center" as const,
    padding: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  messageContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center" as const,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  time: {
    fontSize: 14,
    color: "#a07f4f",
  },
  message: {
    fontSize: 16,
    color: "#a07f4f",
  },
});

