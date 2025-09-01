import axios from 'axios';
import config from '../ts/config';

// Token de API da variável de ambiente
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'G#o1tj67G6^0Ok53KGfIPoSB';

// Debug: log do token (remover em produção)
console.log('🔑 Token sendo usado:', API_TOKEN);

// Configuração do axios para API
const apiClient = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
    },
});

// Interceptor para garantir que o token sempre seja enviado
apiClient.interceptors.request.use(
    (config) => {
        // Garante que o token sempre esteja presente
        config.headers.Authorization = `Bearer ${API_TOKEN}`;
        
        // Debug: log da requisição
        console.log('🔍 Requisição sendo enviada:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Token de API inválido ou expirado');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
