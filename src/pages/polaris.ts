import { nextTick, reactive, ref } from 'vue';
import axios from 'axios';
import { iMensagem } from '../interfaces/interfacePolaris';

const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15);
};

const getSessionId = () => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
        return sessionId;
    } else {
        const newSessionId = generateSessionId();
        localStorage.setItem('session_id', newSessionId);
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
            text: "Olá, em que posso ajudar? 😊",
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
            const newMessage: iMensagem = {
                id: state.messages.length + 1,
                text: state.input,
                sender: 'user',
                timestamp: new Date(),
            };

            try {
                state.loading = true;
                const textUrl = import.meta.env.VITE_API_TEXT_URL;
                state.response = await axios.post(
                    `${textUrl}/inference/`,
                    {
                        prompt: state.input,
                        session_id: state.session_id,
                    },
                    {
                        headers: { 'content-type': 'application/json' },
                        timeout: 60000,
                    }
                );

                const botResponse = state.response.data.resposta;

                state.messages.push(newMessage, {
                    id: state.messages.length + 2,
                    text: botResponse,
                    sender: 'bot',
                    timestamp: new Date(),
                });

                await nextTick();
                state.input = '';
                textAreaRef.value?.focus();
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
                state.loading = false;
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

                // Libera o microfone aqui
                const tracks = state.mediaRecorder?.stream?.getTracks?.();
                tracks?.forEach(track => track.stop());

                const formData = new FormData();
                formData.append("audio", audioBlob);
                formData.append("session_id", state.idChat);

                try {
                    state.loadingAudio = true;
                    const audioUrl = import.meta.env.VITE_API_AUDIO_URL;
                    const res = await axios.post(
                        `${audioUrl}/audio-inference/`,
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                            timeout: 0,
                        }
                    );

                    const resposta = res.data.resposta;
                    const ttsUrl = res.data.tts_audio_url;
                    const userAudioUrl = res.data.user_audio_url;

                    state.messages.push({
                        id: state.messages.length + 1,
                        text: "",
                        sender: "user",
                        timestamp: new Date(),
                        audioUrl: userAudioUrl,
                    });

                    state.messages.push({
                        id: state.messages.length + 2,
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
    }
};

export default { state, actions };
