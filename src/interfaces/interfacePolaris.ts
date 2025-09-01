export interface iMensagem {
    id: number;
    text: string;
    sender: string;
    timestamp: Date;
    audioUrl?: string;
}

// Interfaces para autenticação JWT
export interface iUser {
    user_id: string;
    role: string;
}

export interface iLoginRequest {
    username: string;
    password: string;
}

export interface iRegisterRequest {
    username: string;
    email: string;
    password: string;
    full_name?: string;
}

export interface iAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface iJwtPayload {
    user_id: string;
    role: string;
    exp: number;
    iat: number;
}