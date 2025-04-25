import { nextTick, reactive, ref } from 'vue';
import axios from 'axios';
import { iMensagem } from './interfacePolaris';

// Função para gerar session_id aleatório
const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15); // Gera uma string aleatória
};

// Recuperar session_id do localStorage ou gerar um novo se não existir
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

// Armazenando o session_id no localStorage ao iniciar
const session_id = getSessionId();

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
    session_id: session_id, // Usando o session_id recuperado ou gerado
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
                //const inputBackup = state.input;

                state.response = await axios.post(
                    'https://ky-military-decade-packed.trycloudflare.com/inference/',
                    {
                        prompt: state.input,
                        session_id: state.session_id, // Passando o session_id armazenado
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
                state.input = '';
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
