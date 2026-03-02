import { reactive, computed } from 'vue';
import StorageService from '../services/storageService';
import apiClient, { getJWTToken } from '../services/apiService';
import config from '../ts/config';
import type { IConversation, IMessage, IConversationGroup } from '../interfaces/chatTypes';

const generateSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

export const chatState = reactive({
  currentConvId: null as string | null,
  currentConv: null as IConversation | null,
  allMessages: [] as IMessage[],
  visibleMessages: [] as IMessage[],
  conversations: [] as IConversation[],

  input: '' as string,
  loading: false,
  streaming: false,
  inputDisabled: false,
  isRecording: false,
  loadingAudio: false,
  uploading: false,
  sidebarOpen: false,

  mediaRecorder: null as MediaRecorder | null,
  chunks: [] as BlobPart[],
});

function groupConversationsByDate(conversations: IConversation[]): IConversationGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = todayStart - 7 * 86400000;
  const monthAgo = todayStart - 30 * 86400000;

  const today: IConversation[] = [];
  const lastWeek: IConversation[] = [];
  const lastMonth: IConversation[] = [];
  const older: Map<string, IConversation[]> = new Map();

  for (const conv of conversations) {
    if (conv.lastModified >= todayStart) {
      today.push(conv);
    } else if (conv.lastModified >= weekAgo) {
      lastWeek.push(conv);
    } else if (conv.lastModified >= monthAgo) {
      lastMonth.push(conv);
    } else {
      const date = new Date(conv.lastModified);
      const key = `${date.toLocaleString('pt-BR', { month: 'long' })} ${date.getFullYear()}`;
      if (!older.has(key)) older.set(key, []);
      older.get(key)!.push(conv);
    }
  }

  const groups: IConversationGroup[] = [];
  if (today.length) groups.push({ title: 'Hoje', conversations: today });
  if (lastWeek.length) groups.push({ title: 'Últimos 7 dias', conversations: lastWeek });
  if (lastMonth.length) groups.push({ title: 'Últimos 30 dias', conversations: lastMonth });
  for (const [title, convs] of older) {
    groups.push({ title, conversations: convs });
  }

  return groups;
}

export const groupedConversations = computed(() => groupConversationsByDate(chatState.conversations));

export const chatActions = {
  async init() {
    chatState.conversations = await StorageService.getAllConversations();
  },

  async createNewChat(): Promise<IConversation> {
    const sessionId = generateSessionId();
    const conv = await StorageService.createConversation('Nova conversa', sessionId);
    chatState.conversations = await StorageService.getAllConversations();
    await this.loadConversation(conv.id);
    return conv;
  },

  async loadConversation(convId: string) {
    const conv = await StorageService.getConversation(convId);
    if (!conv) return;

    chatState.currentConvId = convId;
    chatState.currentConv = conv;
    chatState.allMessages = await StorageService.getMessages(convId);
    chatState.visibleMessages = StorageService.filterByLeafNodeId(
      chatState.allMessages,
      conv.currNode
    );
  },

  async refreshCurrentConversation() {
    if (!chatState.currentConvId) return;
    await this.loadConversation(chatState.currentConvId);
  },

  async sendMessage(text: string) {
    if (!text.trim()) return;

    if (!chatState.currentConvId || !chatState.currentConv) {
      await this.createNewChat();
    }

    const conv = chatState.currentConv!;
    const convId = conv.id;
    const parentId = conv.currNode;

    const userMsgId = Date.now();
    await StorageService.appendMessage(
      {
        id: userMsgId,
        convId,
        type: 'text',
        timestamp: userMsgId,
        role: 'user',
        content: text,
      },
      parentId
    );

    if (conv.name === 'Nova conversa') {
      const truncated = text.length > 40 ? text.substring(0, 40) + '...' : text;
      await StorageService.updateConversationName(convId, truncated);
      chatState.conversations = await StorageService.getAllConversations();
    }

    const botMsgId = userMsgId + 1;
    await StorageService.appendMessage(
      {
        id: botMsgId,
        convId,
        type: 'text',
        timestamp: botMsgId,
        role: 'assistant',
        content: '',
      },
      userMsgId
    );

    await this.refreshCurrentConversation();
    chatState.input = '';

    await this._streamResponse(convId, conv.sessionId, text, botMsgId);
  },

  async regenerateResponse(assistantMsgId: number) {
    if (!chatState.currentConv) return;

    const convId = chatState.currentConv.id;
    const assistantMsg = chatState.allMessages.find((m) => m.id === assistantMsgId);
    if (!assistantMsg) return;

    const userMsg = chatState.allMessages.find((m) => m.id === assistantMsg.parent);
    if (!userMsg) return;

    const newBotMsgId = Date.now();
    await StorageService.appendMessage(
      {
        id: newBotMsgId,
        convId,
        type: 'text',
        timestamp: newBotMsgId,
        role: 'assistant',
        content: '',
      },
      userMsg.id
    );
    await this.refreshCurrentConversation();

    await this._streamResponse(
      convId,
      chatState.currentConv.sessionId,
      userMsg.content,
      newBotMsgId
    );
  },

  async editUserMessage(originalMsgId: number, newContent: string) {
    if (!chatState.currentConv) return;

    const convId = chatState.currentConv.id;
    const originalMsg = chatState.allMessages.find((m) => m.id === originalMsgId);
    if (!originalMsg) return;

    const newUserMsgId = Date.now();
    await StorageService.appendMessage(
      {
        id: newUserMsgId,
        convId,
        type: 'text',
        timestamp: newUserMsgId,
        role: 'user',
        content: newContent,
      },
      originalMsg.parent
    );

    const newBotMsgId = newUserMsgId + 1;
    await StorageService.appendMessage(
      {
        id: newBotMsgId,
        convId,
        type: 'text',
        timestamp: newBotMsgId,
        role: 'assistant',
        content: '',
      },
      newUserMsgId
    );
    await this.refreshCurrentConversation();

    await this._streamResponse(
      convId,
      chatState.currentConv!.sessionId,
      newContent,
      newBotMsgId
    );
  },

  async switchBranch(newLeafNodeId: number) {
    if (!chatState.currentConvId) return;
    await StorageService.switchBranch(chatState.currentConvId, newLeafNodeId);
    await this.refreshCurrentConversation();
  },

  async deleteConversation(convId: string) {
    await StorageService.deleteConversation(convId);
    chatState.conversations = await StorageService.getAllConversations();
    if (chatState.currentConvId === convId) {
      chatState.currentConvId = null;
      chatState.currentConv = null;
      chatState.allMessages = [];
      chatState.visibleMessages = [];
    }
  },

  async renameConversation(convId: string, newName: string) {
    await StorageService.updateConversationName(convId, newName);
    chatState.conversations = await StorageService.getAllConversations();
    if (chatState.currentConvId === convId && chatState.currentConv) {
      chatState.currentConv = { ...chatState.currentConv, name: newName };
    }
  },

  async enviarArquivo(file: File) {
    if (!file) return;
    if (!chatState.currentConvId || !chatState.currentConv) {
      await this.createNewChat();
    }
    const conv = chatState.currentConv!;
    const convId = conv.id;

    chatState.uploading = true;

    const statusMsgId = Date.now();
    await StorageService.appendMessage(
      {
        id: statusMsgId,
        convId,
        type: 'text',
        timestamp: statusMsgId,
        role: 'assistant',
        content: `📂 Enviando arquivo: ${file.name}`,
      },
      conv.currNode
    );
    await this.refreshCurrentConversation();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', conv.sessionId);

      await apiClient.post('/upload-pdf/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      const successMsgId = Date.now();
      await StorageService.appendMessage(
        {
          id: successMsgId,
          convId,
          type: 'text',
          timestamp: successMsgId,
          role: 'assistant',
          content: `✅ Arquivo ${file.name} indexado para a sessão.`,
        },
        statusMsgId
      );
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      const errorMsgId = Date.now();
      await StorageService.appendMessage(
        {
          id: errorMsgId,
          convId,
          type: 'text',
          timestamp: errorMsgId,
          role: 'assistant',
          content: `❌ Erro ao enviar ${file.name}.`,
        },
        statusMsgId
      );
    } finally {
      chatState.uploading = false;
      await this.refreshCurrentConversation();
    }
  },

  async toggleRecording() {
    if (!chatState.isRecording) {
      if (!chatState.currentConvId || !chatState.currentConv) {
        await this.createNewChat();
      }

      chatState.chunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chatState.mediaRecorder = new MediaRecorder(stream);
      chatState.mediaRecorder.ondataavailable = (e) => chatState.chunks.push(e.data);

      chatState.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chatState.chunks, { type: 'audio/webm' });
        if (audioBlob.size === 0) return;

        const tracks = chatState.mediaRecorder?.stream?.getTracks?.();
        tracks?.forEach((track) => track.stop());

        const conv = chatState.currentConv!;
        const convId = conv.id;
        const userAudioUrl = URL.createObjectURL(audioBlob);

        const userMsgId = Date.now();
        await StorageService.appendMessage(
          {
            id: userMsgId,
            convId,
            type: 'text',
            timestamp: userMsgId,
            role: 'user',
            content: '',
            audioUrl: userAudioUrl,
          },
          conv.currNode
        );
        await this.refreshCurrentConversation();

        try {
          chatState.loadingAudio = true;
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('session_id', conv.sessionId);

          const res = await apiClient.post(
            `${config.API_AUDIO_URL}/audio-inference/`,
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 9999999,
            }
          );

          const resposta = res.data.resposta;
          const ttsUrl = res.data.tts_audio_url;

          const botMsgId = Date.now();
          await StorageService.appendMessage(
            {
              id: botMsgId,
              convId,
              type: 'text',
              timestamp: botMsgId,
              role: 'assistant',
              content: resposta,
              audioUrl: ttsUrl,
            },
            userMsgId
          );
        } catch (err) {
          console.error('❌ Erro ao enviar áudio:', err);
        } finally {
          chatState.loadingAudio = false;
          chatState.isRecording = false;
          chatState.mediaRecorder = null;
          chatState.chunks = [];
          await this.refreshCurrentConversation();
        }
      };

      chatState.mediaRecorder.start();
      chatState.isRecording = true;
    } else {
      if (chatState.mediaRecorder && chatState.mediaRecorder.state !== 'inactive') {
        chatState.mediaRecorder.stop();
      }
    }
  },

  async _streamResponse(
    convId: string,
    sessionId: string,
    prompt: string,
    botMsgId: number
  ) {
    try {
      chatState.streaming = true;
      chatState.inputDisabled = true;

      // Update visible messages to show typing indicator
      const botIdx = chatState.visibleMessages.findIndex((m) => m.id === botMsgId);
      if (botIdx >= 0) {
        chatState.visibleMessages[botIdx] = {
          ...chatState.visibleMessages[botIdx],
          content: 'digitando...',
        };
      }

      const token = await getJWTToken();
      const resp = await fetch(`${config.API_BASE_URL}/inference/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          session_id: sessionId,
        }),
        cache: 'no-store',
      });

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status} ${errorText || ''}`.trim());
      }
      if (!resp.body) {
        throw new Error('Resposta sem body para streaming');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = '';
      let sseBuffer = '';

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (value) {
          sseBuffer += decoder.decode(value, { stream: true });
          const parts = sseBuffer.split('\n');
          sseBuffer = parts.pop() || '';
          for (const line of parts) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[START]' || data === '[DONE]') continue;
            accumulated += data.replace(/\\n/g, '\n');
          }

          const idx = chatState.visibleMessages.findIndex((m) => m.id === botMsgId);
          if (idx >= 0) {
            chatState.visibleMessages[idx] = {
              ...chatState.visibleMessages[idx],
              content: accumulated || 'digitando...',
            };
          }
        }
        done = streamDone;
      }

      const finalContent = accumulated.trim() || '(resposta vazia)';

      // Persist final content to IndexedDB
      await StorageService.updateMessageContent(botMsgId, finalContent);
      await this.refreshCurrentConversation();
      chatState.conversations = await StorageService.getAllConversations();
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMsgId = Date.now();
      await StorageService.appendMessage(
        {
          id: errorMsgId,
          convId,
          type: 'text',
          timestamp: errorMsgId,
          role: 'assistant',
          content: 'Erro: Não foi possível conectar ao backend.',
        },
        botMsgId
      );
      await this.refreshCurrentConversation();
    } finally {
      chatState.inputDisabled = false;
      chatState.streaming = false;
    }
  },
};
