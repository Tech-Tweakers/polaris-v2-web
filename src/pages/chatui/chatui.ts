import { reactive } from 'vue';
import axios from 'axios';
import { iMensagem } from './interface';

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

                state.response = await axios.post(
                    'http://localhost:8000/inference/',
                    {
                        prompt: state.input,
                        stop_words: ["Pergunta:", "User:"],
                        temperature: 0.2,
                        top_p: 0.2,
                        top_k: 40,
                        frequency_penalty: 2.0,
                        presence_penalty: 2.4,
                        max_tokens: 1024,
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

                console.log(botResponse);
                state.input = '';
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
