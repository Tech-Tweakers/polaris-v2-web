# 🌌 Polaris v2 - Web Client

<div align="center">

![Polaris Logo](public/icons/icon.png)

**Frontend oficial do projeto Polaris v2** - Interface Vue.js minimalista, responsiva e com suporte a entrada de texto e voz, conexão direta com o backend da API Polaris (FastAPI) e suporte a resposta com áudio.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.2.6-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.3.21-1867C0?style=for-the-badge&logo=vuetify&logoColor=white)](https://vuetifyjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.3.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.100-blue.svg?style=for-the-badge)](https://github.com/tech-tweakers/polaris-v2-web)

</div>

---

## 🚀 Features

### ✨ **Interface Moderna**
- 🎨 **Design minimalista** e responsivo
- 🌙 **Tema claro/escuro** automático
- 📱 **Mobile-first** com suporte completo
- ⚡ **Performance otimizada** com Vite

### 🤖 **Inteligência Artificial**
- 🧠 **Integração direta** com API de inferência (`/inference/`)
- 💬 **Chat em tempo real** com histórico persistente
- 🔄 **Respostas pendentes** via `/inference/pending-response/`
- 📝 **Detecção automática** de mensagens vazias

### 🎤 **Entrada por Voz**
- 🎙️ **Gravação de áudio** em tempo real
- 🔊 **Reprodução de resposta** com TTS
- 🎵 **Controles de áudio** nativos
- 📊 **Formato WebM** otimizado

### 📚 **Renderização Avançada**
- 📖 **Markdown completo** com syntax highlighting
- 🎨 **Destaque de código** com highlight.js
- 📋 **Botão de copiar** código
- 🔗 **Links clicáveis** e formatação rica

### 🔐 **Segurança**
- 🛡️ **Autenticação JWT** automática
- 🔄 **Token refresh** inteligente
- 🚫 **Rate limiting** no backend
- 🔒 **Variáveis de ambiente** seguras

### 📦 **Empacotamento**
- 🖥️ **Electron** para desktop (Linux/Windows)
- 📱 **PWA** com service worker
- 🔄 **Auto-update** em produção
- 📦 **Build otimizado** para produção

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **[Vue 3](https://vuejs.org/)** - Framework progressivo
- **[Vite](https://vitejs.dev/)** - Build tool ultra-rápido
- **[Vuetify 3](https://vuetifyjs.com/)** - Component library Material Design
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Axios](https://axios-http.com/)** - Cliente HTTP

### **Processamento**
- **[Marked](https://marked.js.org/)** - Parser Markdown
- **[Highlight.js](https://highlightjs.org/)** - Syntax highlighting
- **[JWT Decode](https://github.com/auth0/jwt-decode)** - Decodificação JWT

### **Empacotamento**
- **[Electron](https://www.electronjs.org/)** - Aplicação desktop
- **[Vite PWA](https://vite-pwa-org.netlify.app/)** - Progressive Web App
- **[Electron Builder](https://www.electron.build/)** - Build de distribuição

---

## 🚀 Quick Start

### **Pré-requisitos**
```bash
# Node.js 18+ e npm
node --version  # v18.0.0+
npm --version   # 8.0.0+
```

### **1. Clone o repositório**
```bash
git clone https://github.com/tech-tweakers/polaris-v2-web.git
cd polaris-v2-web
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure as variáveis de ambiente**

**Crie um arquivo `.env`** (configurações públicas):
```env
# URLs das APIs
VITE_API_TEXT_URL=http://localhost:8000
VITE_API_AUDIO_URL=http://localhost:8010

# Configurações do servidor
VITE_SERVER=localhost
VITE_PORT=2002
```

**Crie um arquivo `.env.local`** (secrets - NÃO versionar):
```env
# Token JWT para autenticação da API
VITE_API_TOKEN=G#o1tj67G6^0Ok53KGfIPoSB
```

### **4. Execute o projeto**
```bash
# Desenvolvimento
npm run dev

# Preview de produção
npm run serve

# Build para produção
npm run build
```

### **5. Acesse a aplicação**
```
🌐 http://localhost:5173
```

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run serve` | Preview do build |
| `npm run app:build` | Build Electron (Linux) |
| `npm run app:buildWin` | Build Electron (Windows) |
| `npm run electron` | Executar Electron em dev |
| `npm run dev:electron` | Dev + Electron simultâneo |

---

## 🔧 Configuração Avançada

### **Variáveis de Ambiente**

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_TEXT_URL` | URL da API principal | `http://localhost:8000` |
| `VITE_API_AUDIO_URL` | URL da API de áudio | `http://localhost:8010` |
| `VITE_API_TOKEN` | Token JWT da API | `G#o1tj67G6^0Ok53KGfIPoSB` |
| `VITE_SERVER` | Servidor local | `localhost` |
| `VITE_PORT` | Porta local | `2002` |

### **Backend Requirements**

O backend deve ter as seguintes variáveis configuradas:
```env
JWT_SECRET="PF&o*8pKNytdxAtz!DOsa6nRkJxMB@X7D7ThbPwzP%E*bQ!*"
JWT_EXPIRY_HOURS=24
WEB_SECRET="G#o1tj67G6^0Ok53KGfIPoSB"
```

---

## 🔌 Comunicação com a API

### **Autenticação JWT**

O frontend obtém automaticamente um token JWT através do endpoint `/auth/token`:

```http
POST /auth/token
Content-Type: application/json

{
  "client_name": "web_client",
  "client_secret": "G#o1tj67G6^0Ok53KGfIPoSB"
}
```

### **Endpoints Principais**

#### **1. Inferência de Texto**
```http
POST /inference/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "prompt": "Qual é a capital do Brasil?",
  "session_id": "abc123"
}
```

#### **2. Inferência de Áudio**
```http
POST /audio-inference/
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

- audio: arquivo .webm
- session_id: "abc123"
```

#### **3. Respostas Pendentes**
```http
GET /inference/pending-response/{session_id}
Authorization: Bearer <jwt_token>
```

---

## 🎨 Personalização

### **Temas**

O sistema suporta temas claro/escuro automaticamente:

```typescript
// Toggle manual do tema
actions.toggleTheme()

// Tema salvo no localStorage
localStorage.getItem('defaultTheme') // 'light' | 'dark'
```

### **Estilos Customizados**

```scss
// src/styles/polaris.scss
.chat-container {
  // Customizações do chat
}

.message {
  // Estilos das mensagens
}
```

---

## 🔒 Segurança

### **Boas Práticas Implementadas**

- ✅ **Variáveis de ambiente** para secrets
- ✅ **JWT automático** com refresh
- ✅ **CORS configurado** no backend
- ✅ **Rate limiting** implementado
- ✅ **Validação de entrada** no frontend
- ✅ **Sanitização de dados** Markdown

### **Arquivos Sensíveis**

```bash
# NÃO versionar
.env.local
.env.*.local

# Pode versionar
.env
.env.example
```

---

## 🐛 Troubleshooting

### **Erro 401 (Unauthorized)**
```bash
# Verificar se o token está correto
echo $VITE_API_TOKEN

# Verificar se o backend está rodando
curl http://localhost:8000/health
```

### **Erro de CORS**
```python
# No backend FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Erro de Build**
```bash
# Limpar cache
rm -rf node_modules
npm install

# Verificar versões
node --version
npm --version
```

---

## 📊 Performance

### **Métricas de Build**
- ⚡ **Build time**: ~30s
- 📦 **Bundle size**: ~2MB
- 🚀 **First load**: ~1.5s
- 🔄 **Hot reload**: ~200ms

### **Otimizações**
- 📦 **Tree shaking** automático
- 🗜️ **Compression** gzip/brotli
- 🖼️ **Image optimization** automática
- 🔄 **Code splitting** inteligente

---

## 🤝 Contribuição

### **1. Fork o projeto**
```bash
git clone https://github.com/seu-usuario/polaris-v2-web.git
cd polaris-v2-web
```

### **2. Crie uma branch**
```bash
git checkout -b feature/nova-feature
```

### **3. Commit suas mudanças**
```bash
git commit -m 'feat: adiciona nova funcionalidade'
```

### **4. Push para a branch**
```bash
git push origin feature/nova-feature
```

### **5. Abra um Pull Request**

### **Convenções de Commit**
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores

- **Vitor Ramos** - *Desenvolvimento inicial* - [vitorr7df](https://github.com/vitorr7df)
- **TechTweakers** - *Mantenedores* - [tech-tweakers](https://github.com/tech-tweakers)

---

## 🙏 Agradecimentos

- [Vue.js](https://vuejs.org/) - Framework incrível
- [Vuetify](https://vuetifyjs.com/) - Componentes lindos
- [Vite](https://vitejs.dev/) - Build tool ultra-rápido
- [FastAPI](https://fastapi.tiangolo.com/) - Backend poderoso

---

<div align="center">

**Feito com ❤️ pela equipe TechTweakers**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tech-tweakers)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/techtweakers)

</div>


