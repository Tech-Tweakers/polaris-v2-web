import axios from 'axios';
import config from '../ts/config';

// Credenciais da API
const CLIENT_NAME = 'web_client';
const CLIENT_SECRET = import.meta.env.VITE_API_TOKEN || 'G#o1tj67G6^0Ok53KGfIPoSB';

// Debug: log das credenciais (remover em produção)
console.log('🔑 Credenciais sendo usadas:', { CLIENT_NAME, CLIENT_SECRET });

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
async function getJWTToken(): Promise<string> {
    // Verifica se já tem um token válido
    if (jwtToken && tokenExpiry && Date.now() < tokenExpiry) {
        return jwtToken;
    }

    try {
        console.log('🔄 Obtendo novo token JWT...');
        
        // O endpoint espera parâmetros de query, não FormData
        const response = await axios.post(`${config.API_BASE_URL}/auth/token?client_name=${CLIENT_NAME}&client_secret=${CLIENT_SECRET}`);

        jwtToken = response.data.access_token;
        // Token expira em 24 horas (86400000 ms)
        tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
        
        console.log('✅ Token JWT obtido com sucesso');
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
