import Dexie, { type Table } from 'dexie';
import type { IConversation, IMessage } from '../interfaces/chatTypes';

const db = new Dexie('PolarisV2') as Dexie & {
  conversations: Table<IConversation>;
  messages: Table<IMessage>;
};

db.version(1).stores({
  conversations: '&id, lastModified',
  messages: '&id, convId, [convId+id], timestamp',
});

const StorageService = {
  async getAllConversations(): Promise<IConversation[]> {
    return (await db.conversations.toArray()).sort(
      (a, b) => b.lastModified - a.lastModified
    );
  },

  async getConversation(convId: string): Promise<IConversation | null> {
    return (await db.conversations.where('id').equals(convId).first()) ?? null;
  },

  async createConversation(name: string, sessionId: string): Promise<IConversation> {
    const now = Date.now();
    const rootId = now;
    const conv: IConversation = {
      id: `conv-${now}`,
      name,
      lastModified: now,
      currNode: rootId,
      sessionId,
    };
    await db.conversations.add(conv);
    await db.messages.add({
      id: rootId,
      convId: conv.id,
      type: 'root',
      timestamp: now,
      role: 'system',
      content: '',
      parent: -1,
      children: [],
    });
    return conv;
  },

  async updateConversationName(convId: string, name: string): Promise<void> {
    await db.conversations.update(convId, { name, lastModified: Date.now() });
  },

  async updateConversationCurrNode(convId: string, currNode: number): Promise<void> {
    await db.conversations.update(convId, { currNode, lastModified: Date.now() });
  },

  async deleteConversation(convId: string): Promise<void> {
    await db.transaction('rw', db.conversations, db.messages, async () => {
      await db.conversations.delete(convId);
      await db.messages.where({ convId }).delete();
    });
  },

  async getMessages(convId: string): Promise<IMessage[]> {
    return await db.messages.where({ convId }).toArray();
  },

  filterByLeafNodeId(
    allMessages: Readonly<IMessage[]>,
    leafNodeId: number,
    includeRoot: boolean = false
  ): IMessage[] {
    const nodeMap = new Map<number, IMessage>();
    for (const msg of allMessages) {
      nodeMap.set(msg.id, msg);
    }

    let startNode = nodeMap.get(leafNodeId);
    if (!startNode) {
      let latestTime = -1;
      for (const msg of allMessages) {
        if (msg.timestamp > latestTime) {
          startNode = msg;
          latestTime = msg.timestamp;
        }
      }
    }

    const path: IMessage[] = [];
    let current: IMessage | undefined = startNode;
    while (current) {
      if (current.type !== 'root' || includeRoot) {
        path.push(current);
      }
      current = current.parent >= 0 ? nodeMap.get(current.parent) : undefined;
    }

    return path.sort((a, b) => a.timestamp - b.timestamp);
  },

  async appendMessage(
    msg: Omit<IMessage, 'parent' | 'children'>,
    parentNodeId: number
  ): Promise<void> {
    const { convId } = msg;
    await db.transaction('rw', db.conversations, db.messages, async () => {
      const parentMsg = await db.messages
        .where('[convId+id]')
        .equals([convId, parentNodeId])
        .first();

      if (!parentMsg) throw new Error(`Parent message ${parentNodeId} not found in ${convId}`);

      await db.conversations.update(convId, {
        lastModified: Date.now(),
        currNode: msg.id,
      });

      await db.messages.update(parentNodeId, {
        children: [...parentMsg.children, msg.id],
      });

      await db.messages.add({
        ...msg,
        parent: parentNodeId,
        children: [],
      });
    });
  },

  async updateMessageContent(msgId: number, content: string): Promise<void> {
    await db.messages.update(msgId, { content });
  },

  async switchBranch(convId: string, newLeafNodeId: number): Promise<void> {
    await db.conversations.update(convId, {
      currNode: newLeafNodeId,
      lastModified: Date.now(),
    });
  },
};

export default StorageService;
export { db };
