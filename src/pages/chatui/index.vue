<script setup lang="ts">
import { ref, watch, nextTick } from "vue"; // Removida a importação duplicada
import globalActions from "../../store/globalActions";
import { actions, state } from "./chatui";

const chatContainer = ref<HTMLElement | null>(null);
const isDrawerOpen = ref(false);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

// Aguarda nova mensagem e rola para baixo se for do bot
watch(
  () => state.messages.length,
  async () => {
    await nextTick(); // Aguarda o Vue renderizar completamente antes de rolar
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage?.sender === "bot") {
      scrollToBottom();
    }
  }
);
</script>


<template>
  <v-app>
    <!-- Barra lateral -->
    <v-navigation-drawer v-model="isDrawerOpen" app flat class="drawer">
      <v-list>
        <v-list-subheader>Menu</v-list-subheader>
        <v-list-item prepend-icon="mdi-home" title="Home"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="Usuários"></v-list-item>
        <v-list-group value="Clientes">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-account-circle"
              title="Clientes"
            ></v-list-item>
          </template>
          <v-list-item
            prepend-icon="mdi-currency-usd"
            title="Vendas"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-chart-line"
            title="Relatório"
          ></v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <!-- Barra de aplicativo -->
    <v-app-bar app flat class="app-bar">
      <v-app-bar-nav-icon
        @click="isDrawerOpen = !isDrawerOpen"
      ></v-app-bar-nav-icon>
      <v-app-bar-title>
        <span class="ml-5">Polaris AI</span>
        <v-icon>
          <img class="logo" src="../../../public/icons/icon.png" alt="logo" />
        </v-icon>
      </v-app-bar-title>
      <template #append>
        <v-btn
          @click="globalActions.toggleTheme()"
          variant="text"
          color="auto"
          icon="mdi-theme-light-dark"
        ></v-btn>
        <v-btn icon class="mr-2">
          <v-badge dot color="info">
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-avatar v-bind="props">
              <v-img
                src="https://thumbs.dreamstime.com/z/nerd-portrait-young-cheerful-businessman-smiling-36201399.jpg"
              ></v-img>
            </v-avatar>
          </template>
          <v-card min-width="200px">
            <v-list density="compact" nav>
              <v-list-item
                prepend-icon="mdi-account-outline"
                title="Meu perfil"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-heart-outline"
                title="Favoritos"
              ></v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- Conteúdo principal -->
    <v-main class="main-content">
      <div class="header">
        <div class="chat-container ml-8" ref="chatContainer">
          <div
            v-for="message in state.messages"
            :key="message.id"
            class="message"
            :class="{
              'user-message': message.sender === 'user',
              'bot-message': message.sender === 'bot',
            }"
          >
            <v-avatar size="35px" color="primary">
              <v-img
                :src="
                  message.sender === 'user'
                    ? state.userAvatarSrc
                    : state.botAvatarSrc
                "
              />
            </v-avatar>
            {{ message.text }}
          </div>
        </div>

        <!-- Ondas -->
        <div class="waves-container">
          <svg
            class="waves"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shape-rendering="auto"
          >
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g class="parallax">
              <use xlink:href="#gentle-wave" x="48" y="0" />
              <use xlink:href="#gentle-wave" x="48" y="3" />
              <use xlink:href="#gentle-wave" x="48" y="5" />
              <use xlink:href="#gentle-wave" x="48" y="7" />
            </g>
          </svg>
        </div>

        <!-- Área de entrada de mensagem -->
        <div class="textArea">
          <v-textarea
            v-model="state.input"
            label="Type a message"
            @keydown.enter.prevent="actions.enviarMsg"
          >
            <template #append>
              <v-btn @click="actions.enviarMsg" color="primary">
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </template>
          </v-textarea>
        </div>
      </div>
    </v-main>

    <!-- Rodapé -->
    <v-footer app>
      <div class="copyright">©Polaris 2025</div>
      <div class="copyright ml-4">Versão: 2.0</div>
    </v-footer>

    <!-- Overlay de carregamento -->
    <v-overlay :model-value="state.loading" persistent>
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<style lang="scss" scoped>
.app-bar {
  background-color: transparent !important; /* Remove a cor de fundo */
  box-shadow: none !important; /* Remove a sombra */
}

.drawer {
  background-color: transparent !important; /* Remove a cor de fundo */
  border-right: none !important; /* Remove a borda */
}

.logo {
  width: 23px; /* Tamanho reduzido da logo */
  height: 23px;
  margin-left: 10px;
  margin-bottom: 5px;
}

.main-content {
  overflow: hidden; /* Remove scroll desnecessário */
  height: 100vh; /* Altura fixa da tela */
}

.header {
  position: relative;
  background: linear-gradient(
    60deg,
    rgb(130, 105, 233) 0%,
    rgb(90, 236, 255) 100%
  );
  color: white;
  height: 100vh; /* Altura fixa da tela */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dark .header {
  background: linear-gradient(
    112.1deg,
    rgb(32, 38, 57) 11.4%,
    rgb(63, 76, 119) 70.2%
  );
}

.chat-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  margin-bottom: 20px;
  max-height: calc(100vh - 200px);
}

.messageInicial {
  font-size: 17px;
  padding: 16px;
}

.message {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  padding: 18px;
  margin-bottom: 8px;
  max-width: 70%;
  word-wrap: break-word;
}

.user-message {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px 8px 0 8px;
}

.bot-message {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px 8px 8px 0;
}

.waves-container {
  position: relative;
  width: 100%;
  height: 15vh;
  overflow: hidden;
}

.waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
  fill: rgba(255, 255, 255, 0.7);
}

.dark .parallax > use:nth-child(1) {
  fill: rgba(32, 38, 57, 0.7);
}

.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
  fill: rgba(255, 255, 255, 0.5);
}

.dark .parallax > use:nth-child(2) {
  fill: rgba(32, 38, 57, 0.5);
}

.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
  fill: rgba(255, 255, 255, 0.3);
}

.dark .parallax > use:nth-child(3) {
  fill: rgba(32, 38, 57, 0.3);
}

.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
  fill: rgba(255, 255, 255, 1);
}

.dark .parallax > use:nth-child(4) {
  fill: rgba(63, 76, 119, 0.8);
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

.copyright {
  font-size: 14px;
}

.textArea {
  margin-bottom: 50px;
}

@media (max-width: 600px) {
  .chat-container {
    padding: 8px;
    max-height: calc(100vh - 150px); /* Ajuste para dispositivos móveis */
  }

  .message {
    max-width: 90%;
    white-space: pre-wrap; /* Permite que as quebras de linha sejam respeitadas */
    word-break: break-word; /* Quebra palavras longas */
  }

  .waves {
    height: 10vh;
  }

  .textArea {
    margin-bottom: 100px;
  }
}
</style>
