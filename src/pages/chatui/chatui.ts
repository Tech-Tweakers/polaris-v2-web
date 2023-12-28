import { ref, onMounted } from 'vue';
import axios from 'axios';

let r = (Math.random() + 1).toString(36).substring(7);

interface Message {
    id: number;
    text: string;
    sender: string;
    timestamp: Date;
}

const input = ref<string>('');
const messages = ref<Message[]>([]);
const inputDisabled = ref(false);
const loading = ref(false);

const LOCAL_STORAGE_KEY = 'chatMessages';

const saveMessagesToLocalStorage = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages.value));
};

const loadMessagesFromLocalStorage = () => {
    const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedMessages) {
        messages.value = JSON.parse(storedMessages);
    }
};

const handleSend = async () => {
    if (input.value.trim() !== '') {
        inputDisabled.value = true;
        const newMessage: Message = {
            id: messages.value.length + 1,
            text: input.value,
            sender: 'user',
            timestamp: new Date(),
        };

        try {
            loading.value = true;

            const response = await axios.post(
                'https://sure-cheaply-kite.ngrok-free.app/entries/',
                [
                    {
                        role: 'user:',
                        content: input.value,
                        chatID: r,
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

            const botResponse = response.data.content;
            messages.value.push(newMessage, {
                id: messages.value.length + 2,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date(),
            });

            console.log(botResponse);

            input.value = '';
            saveMessagesToLocalStorage(); // Salva as mensagens no localStorage após o envio bem-sucedido
        } catch (error) {
            console.error('Error sending message:', error);
            messages.value.push({
                id: messages.value.length + 1,
                text: `Error: Could not connect to the backend: ${error}`,
                sender: 'bot',
                timestamp: new Date(),
            });
        } finally {
            loading.value = false;
            inputDisabled.value = false;
        }
    }
};

// onMounted(() => {
//     loadMessagesFromLocalStorage();
//     // Exemplo: Carregar mensagens iniciais se o localStorage estiver vazio
//     if (messages.value.length === 0) {
//         messages.value.push({
//             id: 1,
//             text: 'Hello! How can I help you? 😊',
//             sender: 'bot',
//             timestamp: new Date(),
//         });
//     }
// });

const setup = () => {
    loadMessagesFromLocalStorage();
    if (messages.value.length === 0) {
        messages.value.push({
            id: 1,
            text: 'Hello! How can I help you? 😊',
            sender: 'bot',
            timestamp: new Date(),
        });
    }
};


export { messages, input, inputDisabled, loading, handleSend, setup };
