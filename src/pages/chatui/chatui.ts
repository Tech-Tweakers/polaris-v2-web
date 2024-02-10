import { reactive } from 'vue';
import axios from 'axios';
import { iMensagem } from './interface';

export const state = reactive({
    loading: false,
    input: <string | null>null,
    messages: <iMensagem[]>([]),
    response: <any>null,
    inputDisabled: false,
    idChat: (Math.random() + 1).toString(36).substring(7)
})

export const actions = {

    async enviarMsg() {
        if (state.input.trim() !== '') {
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
                    'http://localhost:9001/chat/send',
                    [
                        {
                            role: 'user:',
                            content: state.input,
                            chatID: state.idChat,
                        },
                    ],
                    {
                        headers: {
                            'content-type': 'application/json',
                            'Access-Control-Allow-Credentials': 'true',
                            'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': '*',
                        },
                    }
                );

                const botResponse = state.response.data.content;
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
                    text: `Error: Could not connect to the backend: ${error}`,
                    sender: 'bot',
                    timestamp: new Date(),
                });
            } finally {
                state.inputDisabled = false;
                state.loading = false;
            }
        }
    },

    setup() {
        if (state.messages.length === 0) {
            state.messages.push({
                id: 1,
                text: 'Hello! How can I help you? 😊',
                sender: 'bot',
                timestamp: new Date(),
            });
        }
    }

}

export default { state, actions };
