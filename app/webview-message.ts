import { ShareContent, ShareOptions } from "react-native/Libraries/Share/Share";

export interface ShareData{
    content: ShareContent;
    options?: ShareOptions;
}

export enum WebViewMessageType {
    share = 'share',
}

export interface WebViewMessage {
    type: WebViewMessageType;
    data: ShareData;
}