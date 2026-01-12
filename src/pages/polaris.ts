import { nextTick, reactive, ref } from 'vue';
import apiClient, { getJWTToken } from '../services/apiService';
import { iMensagem } from '../interfaces/interfacePolaris';
import config from '../ts/config';

const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15);
};

const getSessionId = () => {
    const sessionId = sessionStorage.getItem('session_id');
    if (sessionId) {
        return sessionId;
    } else {
        const newSessionId = generateSessionId();
        sessionStorage.setItem('session_id', newSessionId);
        return newSessionId;
    }
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
});

const textAreaRef = ref();

export const actions = {

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
                state.loading = true;

                // Obtém token JWT
                const token = localStorage.getItem('jwt_token') || await getJWTToken();

                // Usar XMLHttpRequest para streaming SSE
                const xhr = new XMLHttpRequest();

                xhr.open('POST', `${config.API_BASE_URL}/inference/stream/`, true);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                // FormData para enviar
                const formData = new FormData();
                formData.append('prompt', userText);
                formData.append('session_id', state.session_id);

                let fullResponse = '';
                let lastLength = 0;

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 3) { // Receiving data
                        const newData = xhr.responseText.substring(lastLength);
                        lastLength = xhr.responseText.length;

                        console.log('📦 Dados recebidos:', JSON.stringify(newData));

                        // Processar dados SSE
                        const lines = newData.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                console.log('🎯 Data SSE:', JSON.stringify(data));

                                if (data === '[START]') {
                                    console.log('🎬 Streaming iniciado');
                                } else if (data === '[DONE]') {
                                    console.log('✅ Streaming concluído');
                                    state.loading = false;
                                    state.inputDisabled = false;
                                } else if (data.startsWith('[ERROR]')) {
                                    const errorMsg = data.replace('[ERROR]', '');
                                    state.messages[botMessageIndex].text = `Erro: ${errorMsg}`;
                                    state.loading = false;
                                    state.inputDisabled = false;
                                } else if (!data.startsWith('[')) {
                                    // Chunk de texto normal
                                    fullResponse += data;
                                    // Forçar reatividade atualizando diretamente o array
                                    state.messages[botMessageIndex].text = fullResponse;
                                    console.log('📄 Texto atual:', JSON.stringify(fullResponse));

                                    // Scroll automático durante streaming
                                    setTimeout(() => {
                                        const chatContainer = document.querySelector('.chat-container') as HTMLElement;
                                        if (chatContainer) {
                                            chatContainer.scrollTop = chatContainer.scrollHeight;
                                        }
                                    }, 10);
                                }
                            }
                        }
                    }
                };

                xhr.onload = () => {
                    console.log('✅ XMLHttpRequest concluído');
                    if (!fullResponse) {
                        state.messages[botMessageIndex].text = 'Erro: Resposta vazia do servidor.';
                    }
                    state.loading = false;
                    state.inputDisabled = false;
                };

                xhr.onerror = (error) => {
                    console.error('❌ Erro XMLHttpRequest:', error);
                    state.messages[botMessageIndex].text = 'Erro: Não foi possível conectar ao backend.';
                    state.loading = false;
                    state.inputDisabled = false;
                };

                console.log('🚀 Enviando XMLHttpRequest para streaming...');
                xhr.send(formData);

            } catch (error) {
                console.error('Error sending message:', error);
                state.messages[botMessageIndex].text = `Erro: Não foi possível conectar ao backend.`;
                state.loading = false;
                state.inputDisabled = false;
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
