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
            const newMessage = {
                id: state.messages.length + 1,
                text: state.input,
                sender: 'user',
                timestamp: new Date(),
            };

            try {
                state.loading = true;
                state.response = await axios.post(
                    'http://localhost:8000/estruturar-meta/',
                    { meta: state.input },
                    { headers: { 'content-type': 'application/json' } }
                );

                // Função de tratamento ultra-robusta
                const parseJSONResiliente = (raw) => {
                    // Caso 1: Já é um objeto válido
                    if (typeof raw === 'object' && raw !== null) return raw;

                    // Caso 2: É string que precisa ser parseada
                    if (typeof raw === 'string') {
                        // Etapa 1: Limpeza pesada
                        let jsonStr = raw
                            .replace(/\\"/g, '"')  // Remove escapes
                            .replace(/_+/g, '')    // Remove underscores
                            .replace(/\/\/.*$/gm, '')  // Remove comentários
                            .replace(/'([^']+)'/g, '"$1"')  // Aspas simples para duplas
                            .replace(/(\w+)\s*:/g, '"$1":')  // Aspas em chaves
                            .replace(/,\s*([}\]])/g, '$1');  // Remove vírgulas finais

                        // Etapa 2: Correção de arrays malformados
                        jsonStr = jsonStr.replace(/\[\s*{/g, '[{').replace(/}\s*\]/g, '}]');

                        // Etapa 3: Completa estruturas abertas
                        const openBraces = jsonStr.split('{').length - jsonStr.split('}').length;
                        const openBrackets = jsonStr.split('[').length - jsonStr.split(']').length;

                        jsonStr += '}'.repeat(Math.max(0, openBraces));
                        jsonStr += ']'.repeat(Math.max(0, openBrackets));

                        // Etapa 4: Parse com fallback
                        try {
                            return JSON.parse(jsonStr);
                        } catch (e) {
                            console.warn("Falha ao parsear JSON limpo, tentando abordagem alternativa");

                            // Abordagem de último recurso: extração de campos-chave
                            const camposExtraidos = {
                                titulo: extrairCampo(raw, ['_titulo_', 'titulo', 'title']) || "Meta sem título",
                                categorias: extrairLista(raw, ['categorias', 'categoria1', 'categories']) || [],
                                submetas: extrairSubmetas(raw)
                            };

                            return { meta: camposExtraidos };
                        }
                    }

                    return { error: "Formato de resposta não reconhecido", raw };
                };

                // Funções auxiliares
                const extrairCampo = (texto, possiveisChaves) => {
                    for (const chave of possiveisChaves) {
                        const regex = new RegExp(`"${chave}"\\s*:\\s*"([^"]+)"`);
                        const match = texto.match(regex);
                        if (match) return match[1];
                    }
                    return null;
                };

                const extrairLista = (texto, possiveisChaves) => {
                    for (const chave of possiveisChaves) {
                        const regex = new RegExp(`"${chave}"\\s*:\\s*\\[([^\\]]+)\\]`);
                        const match = texto.match(regex);
                        if (match) {
                            return match[1].split(',').map(item => item.trim().replace(/"/g, '')).filter(Boolean);
                        }
                    }
                    return [];
                };

                const extrairSubmetas = (texto) => {
                    const submetas = [];
                    const regex = /{(.*?)}/gs;
                    let match;

                    while ((match = regex.exec(texto)) !== null) {
                        const submetaStr = match[1];
                        const submeta = {
                            titulo: extrairCampo(submetaStr, ['titulo', 'title', 'Título']),
                            acao: extrairCampo(submetaStr, ['planoDeAcao', 'planOfAction', 'ação']),
                            prazo: extrairCampo(submetaStr, ['prazo', 'deadline', 'Prazo'])
                        };

                        if (submeta.titulo) {
                            submetas.push(submeta);
                        }
                    }

                    return submetas;
                };

                // Processa a resposta
                const respostaTratada = parseJSONResiliente(state.response.data.resposta_bruta || state.response.data);

                // Formatação para exibição
                const formatarResposta = (obj) => {
                    if (obj.error) {
                        return `❌ Erro: ${obj.error}\nResposta original:\n${obj.raw || 'N/A'}`;
                    }

                    const meta = obj.meta || obj;
                    let output = `📌 ${meta.titulo || 'Meta sem título'}\n\n`;

                    if (meta.categorias?.length > 0) {
                        output += `🏷 Categorias: ${meta.categorias.join(', ')}\n\n`;
                    }

                    if (meta.submetas?.length > 0) {
                        output += `🔍 Submetas:\n`;
                        meta.submetas.forEach((sub, i) => {
                            output += `${i + 1}. ${sub.titulo || 'Submeta sem título'}\n`;
                            if (sub.acao) output += `   - Ação: ${sub.acao}\n`;
                            if (sub.prazo) output += `   - Prazo: ${sub.prazo}\n`;
                            output += '\n';
                        });
                    } else {
                        output += `ℹ️ Nenhuma submeta identificada na resposta\n`;
                    }

                    return output;
                };

                const mensagemBot = formatarResposta(respostaTratada);

                state.messages.push(newMessage, {
                    id: state.messages.length + 2,
                    text: mensagemBot,
                    sender: 'bot',
                    timestamp: new Date(),
                });

                console.log("Resposta tratada:", respostaTratada);
                state.input = '';

            } catch (error) {
                console.error('Erro na requisição:', error);
                state.messages.push({
                    id: state.messages.length + 1,
                    text: `❌ Erro: ${error.response?.data?.message || error.message || 'Falha na comunicação com o servidor'}`,
                    sender: 'bot',
                    timestamp: new Date(),
                });
            } finally {
                state.inputDisabled = false;
                state.loading = false;
            }
        }
    }
};

export default { state, actions };
