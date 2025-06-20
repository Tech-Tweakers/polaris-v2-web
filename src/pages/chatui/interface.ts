export interface iMensagem {
    id: number;
    text: string;
    sender: string;
    timestamp: Date;
    audioUrl?: string; // 👈 aqui está o pulo do gato
}