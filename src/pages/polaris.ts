import { nextTick, reactive, ref } from 'vue';
import apiClient, { getJWTToken } from '../services/apiService';
import { iMensagem } from '../interfaces/interfacePolaris';
import config from '../ts/config';

const generateSessionId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
};

// Sempre inicia um session_id novo para cada sessão do navegador
const getSessionId = () => {
    const newSessionId = generateSessionId();
    try {
        sessionStorage.setItem('session_id', newSessionId);
    } catch (err) {
        console.warn('Não foi possível salvar o session_id na sessionStorage.', err);
    }
    return newSessionId;
};


const session_id = getSessionId();

export const state = reactive({
    loading: false,
    input: <string | null>null,
    messages: <iMensagem[]>([
        {
            id: 1,
            text: "Olá, em que posso ajudar?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]),
    response: <any>null,
    inputDisabled: false,
    idChat: (Math.random() + 1).toString(36).substring(7),
    userAvatarSrc: 'src/assets/user.png',
    botAvatarSrc: 'src/assets/bot.png',
    session_id: session_id,
    isRecording: false,
    loadingAudio: false,
    mediaRecorder: null as MediaRecorder | null,
    chunks: <BlobPart[]>[],
    streaming: false,
    uploading: false,
});

const textAreaRef = ref();

export const actions = {

    async enviarArquivo(file: File) {
        if (!file) return;
        state.uploading = true;

        // Mensagem de status
        state.messages.push({
            id: state.messages.length + 1,
            text: `📂 Enviando arquivo: ${file.name}`,
            sender: "bot",
            timestamp: new Date(),
        });

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("session_id", state.session_id);

            await apiClient.post(`/upload-pdf/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 120000,
            });

            state.messages.push({
                id: state.messages.length + 1,
                text: `✅ Arquivo ${file.name} indexado para a sessão.`,
                sender: "bot",
                timestamp: new Date(),
            });
        } catch (error) {
            console.error("Erro ao enviar arquivo:", error);
            state.messages.push({
                id: state.messages.length + 1,
                text: `❌ Erro ao enviar ${file.name}.`,
                sender: "bot",
                timestamp: new Date(),
            });
        } finally {
            state.uploading = false;
        }
    },

    async enviarMsg() {
        if (state.input?.trim()) {
            state.inputDisabled = true;

            const userText = state.input.trim();
            const newMessage: iMensagem = {
                id: state.messages.length + 1,
                text: userText,
                sender: 'user',
                timestamp: new Date(),
            };

            // ✅ Exibe a mensagem do usuário imediatamente
            state.messages.push(newMessage);
            state.input = '';
            await nextTick();
            textAreaRef.value?.focus();

            // Cria mensagem do bot que será atualizada em tempo real
            const botMessageIndex = state.messages.length;
            const botMessage: iMensagem = {
                id: botMessageIndex + 1,
                text: '',
                sender: 'bot',
                timestamp: new Date(),
            };
            state.messages.push(botMessage);

            try {
                state.streaming = true;

                // Cria placeholder para a resposta do bot
                const botMessage = {
                    id: state.messages.length + 1,
                    text: "digitando...", // placeholder animável no UI
                    sender: "bot" as const,
                    timestamp: null as unknown as Date | null,
                };
                state.messages.push(botMessage);

                // Obter token e fazer streaming manual com fetch
                const token = await getJWTToken();
                const resp = await fetch(`${config.API_BASE_URL}/inference/stream`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        prompt: userText,
                        session_id: state.session_id,
                    }),
                    // evita buffering agressivo em alguns proxies
                    cache: "no-store",
                });

                if (!resp.ok) {
                    const errorText = await resp.text().catch(() => "");
                    throw new Error(`HTTP ${resp.status} ${errorText || ""}`.trim());
                }
                if (!resp.body) {
                    throw new Error("Resposta sem body para streaming");
                }

                const reader = resp.body.getReader();
                const decoder = new TextDecoder();
                let done = false;
                let accumulated = "";
                let firstChunk = true;

                while (!done) {
                    const { value, done: streamDone } = await reader.read();
                    if (value) {
                        const chunk = decoder.decode(value, { stream: true });
                        if (chunk) {
                            console.debug("chunk recebido:", chunk);
                        }
                        accumulated += chunk;
                        if (firstChunk && chunk.trim().length > 0) {
                            firstChunk = false;
                        }
                        botMessage.text = accumulated || (firstChunk ? "digitando..." : "...");
                    }
                    done = streamDone;
                }

                botMessage.text = accumulated.trim() || "(resposta vazia)";
        botMessage.timestamp = new Date(); // timestamp de término do streaming
            } catch (error) {
                console.error('Error sending message:', error);
                state.messages.push({
                    id: state.messages.length + 1,
                    text: `Erro: Não foi possível conectar ao backend.`,
                    sender: 'bot',
                    timestamp: new Date(),
                });
            } finally {
                state.inputDisabled = false;
                state.streaming = false;
            }
        }
    },

    async toggleRecording() {
        if (!state.isRecording) {
            // Iniciar gravação
            state.chunks = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            state.mediaRecorder = new MediaRecorder(stream);
            state.mediaRecorder.ondataavailable = e => state.chunks.push(e.data);

            state.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(state.chunks, { type: 'audio/webm' });

                if (audioBlob.size === 0) return;

                // Libera o microfone
                const tracks = state.mediaRecorder?.stream?.getTracks?.();
                tracks?.forEach(track => track.stop());

                const formData = new FormData();
                formData.append("audio", audioBlob);
                formData.append("session_id", state.session_id);

                const userAudioUrl = URL.createObjectURL(audioBlob); // ⚠️ temporário, pode trocar pelo da API depois

                // ✅ Adiciona a mensagem do usuário com o áudio **antes de enviar**
                state.messages.push({
                    id: state.messages.length + 1,
                    text: "",
                    sender: "user",
                    timestamp: new Date(),
                    audioUrl: userAudioUrl,
                });

                try {
                    state.loadingAudio = true;
                    const res = await apiClient.post(
                    `${config.API_AUDIO_URL}/audio-inference/`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                        timeout: 9999999,
                        onDownloadProgress: () => {
                        console.log("📥 Backend ainda respondendo...");
                        }
                    }
                    );


                    const resposta = res.data.resposta;
                    const ttsUrl = res.data.tts_audio_url;

                    state.messages.push({
                        id: state.messages.length + 1,
                        text: resposta,
                        sender: "bot",
                        timestamp: new Date(),
                        audioUrl: ttsUrl,
                    });
                } catch (err) {
                    console.error("❌ Erro ao enviar áudio:", err);
                } finally {
                    state.loadingAudio = false;
                    state.isRecording = false;
                    state.mediaRecorder = null;
                    state.chunks = [];
                }
            };


            state.mediaRecorder.start();
            state.isRecording = true;
        } else {
            if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
                state.mediaRecorder.stop();
            }
        }
    },

    checkPendingResponse() {
        apiClient
            .get(`/inference/pending-response/${state.session_id}`)
            .then((res) => {
                if (res.data?.resposta) {
                    // 🧼 Limpa o prefixo de session_id, se existir
                    const cleanText = res.data.resposta.replace(/^\[session_id=.*?\]\n?/, '');

                    // ✅ Evita mensagens duplicadas com base no conteúdo limpo
                    const jaTem = state.messages.some(
                        (msg) => msg.text === cleanText && msg.sender === 'bot'
                    );

                    if (!jaTem) {
                        state.messages.push({
                            id: state.messages.length + 1,
                            text: cleanText,
                            sender: 'bot',
                            timestamp: new Date(),
                        });
                    }
                }
            })
            .catch((err) => {
                console.warn("⚠️ Erro ao verificar resposta pendente:", err);
            });
    }
};
export default { state, actions };

// setInterval(() => {
//     actions.checkPendingResponse();
// }, 2000); // verifica a cada 2 segundos
