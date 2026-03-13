import axios from 'axios';
import config from '../ts/config';

// Credenciais da API
const CLIENT_NAME = 'web_client';
const CLIENT_SECRET = import.meta.env.VITE_API_TOKEN || config.API_TOKEN || '';

// Configuração do axios para API
const apiClient = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Cache do token JWT
let jwtToken: string | null = null;
let tokenExpiry: number | null = null;

// Função para obter token JWT
export async function getJWTToken(): Promise<string> {
    // Verifica se já tem um token válido
    if (jwtToken && tokenExpiry && Date.now() < tokenExpiry) {
        return jwtToken;
    }

    try {
        if (!CLIENT_SECRET) {
            throw new Error('Token da API não configurado no frontend (VITE_API_TOKEN/API_TOKEN)');
        }

        // O endpoint espera parâmetros de query, não FormData
        const response = await axios.post(
            `${config.API_BASE_URL}/auth/token?client_name=${CLIENT_NAME}&client_secret=${CLIENT_SECRET}`
        );

        const accessToken = response.data?.access_token;
        if (!accessToken) {
            throw new Error('Token ausente na resposta do backend');
        }

        jwtToken = accessToken;
        const expiresInSeconds = response.data?.expires_in ?? 24 * 60 * 60;
        tokenExpiry = Date.now() + expiresInSeconds * 1000;

        return jwtToken;
    } catch (error) {
        console.error('❌ Erro ao obter token JWT:', error);
        throw error;
    }
}

// Interceptor para garantir que o token sempre seja enviado
apiClient.interceptors.request.use(
    async (config) => {
        // Obtém o token JWT antes de cada requisição
        const token = await getJWTToken();
        config.headers.Authorization = `Bearer ${token}`;
        
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
