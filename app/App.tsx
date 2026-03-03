import React from "react";
import { SafeAreaView, Share } from "react-native";
import { WebView } from 'react-native-webview';
import { ShareData, WebViewMessage, WebViewMessageType } from "./webview-message";

export default function App() {
  const shareMessage = async (data: ShareData) => {
    await Share.share(data.content, data.options);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        source={{ uri: 'https://jsvptf.com' }}
        onMessage={(event) => {
          const message: WebViewMessage = JSON.parse(event.nativeEvent.data)

          if (message.type === WebViewMessageType.share) {
            shareMessage(message.data);
          }
        }}
      />
    </SafeAreaView>
  );
}

