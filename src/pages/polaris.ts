import { nextTick, reactive, ref } from 'vue';
import axios from 'axios';
import { iMensagem } from './interfacePolaris';

export const state = reactive({
    loading: false,
    input: <string | null>null,
    messages: <iMensagem[]>([
        {
            id: 1,
            text: "Olá! Eu sou a Polaris. Como posso ajudá-lo? 😊",
            sender: 'bot',
            timestamp: new Date()
        }
    ]), // Mensagem inicial da Polaris
    response: <any>null,
    inputDisabled: false,
    idChat: (Math.random() + 1).toString(36).substring(7),
    userAvatarSrc: 'src/assets/user.png',
    botAvatarSrc: 'src/assets/bot.png',
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
                const inputBackup = state.input;
                state.input = '';

                state.response = await axios.post(
                    'http://localhost:8000/inference/',
                    {
                        prompt: state.input,
                        session_id: "123456789",
                        stop_words: ["Pergunta:", "User:"],
                    },
                    {
                        headers: { 'content-type': 'application/json' },
                    }
                );

                const botResponse = state.response.data.resposta;

                state.messages.push(newMessage, {
                    id: state.messages.length + 2,
                    text: botResponse,
                    sender: 'bot',
                    timestamp: new Date(),
                });

                await nextTick(); // aguarda render
                textAreaRef.value?.focus(); // dá foco
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
};

export default { state, actions };
