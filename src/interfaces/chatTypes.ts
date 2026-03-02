export interface IMessage {
  id: number;
  convId: string;
  type: 'text' | 'root';
  timestamp: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audioUrl?: string;
  parent: number;
  children: number[];
}

export interface IConversation {
  id: string;
  name: string;
  lastModified: number;
  currNode: number;
  sessionId: string;
}

export interface IViewingChat {
  conv: Readonly<IConversation>;
  messages: Readonly<IMessage[]>;
  allMessages: Readonly<IMessage[]>;
}

export interface IConversationGroup {
  title?: string;
  conversations: IConversation[];
}
