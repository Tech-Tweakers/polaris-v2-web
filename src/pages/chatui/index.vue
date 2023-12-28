<script setup lang="ts">
import { ref } from "vue";
import globalActions from "../../store/globalActions";
import { handleSend, input, messages, setup } from "./chatui";
setup();
const isDrawerOpen = ref(false);
</script>

<template>
  <v-btn
    @click="globalActions.toggleTheme()"
    variant="text"
    class="btnDark"
    color="white"
    icon="mdi-theme-light-dark"
  ></v-btn>

  <div class="header">
    <!--Content before waves-->
    <div :class="{ barraTopOpen: isDrawerOpen, barraTopClosed: !isDrawerOpen }">
      <div class="barraTop">
        <v-navigation-drawer v-model="isDrawerOpen" flat class="barraLateral">
          <v-list>
            <v-list-subheader>Menu</v-list-subheader>
            <v-list-item prepend-icon="mdi-home">Home</v-list-item>
            <v-list-item prepend-icon="mdi-account">Usuários</v-list-item>

            <v-list-group value="Clientes">
              <template #activator="{ props }">
                <v-list-item v-bind="props" prepend-icon="mdi-account-circle"
                  >Clientes</v-list-item
                >
              </template>

              <v-list-item prepend-icon="mdi-currency-usd">Vendas</v-list-item>
              <v-list-item prepend-icon="mdi-chart-line">Relatório</v-list-item>
            </v-list-group>
          </v-list>
        </v-navigation-drawer>
        <v-app-bar class="barra">
          <v-app-bar-nav-icon
            @click="isDrawerOpen = !isDrawerOpen"
          ></v-app-bar-nav-icon>
          <v-app-bar-title
            >Polaris AI
            <v-icon
              ><img
                class="logo"
                src="../../../public/icons/icon.png"
                alt="logo"
                style="margin-left: 50px; margin-top: -0.5px"
            /></v-icon>
          </v-app-bar-title>

          <template #append>
            <v-btn icon class="mr-2">
              <v-badge dot color="info">
                <v-icon icon="mdi-bell-outline"></v-icon>
              </v-badge>
            </v-btn>

            <v-menu>
              <template #activator="{ props }">
                <v-avatar v-bind="props">
                  <v-img
                    cover
                    src="https://thumbs.dreamstime.com/z/nerd-portrait-young-cheerful-businessman-smiling-36201399.jpg"
                  ></v-img>
                </v-avatar>
              </template>

              <v-card min-width="200px">
                <v-list :lines="false" density="compact" nav>
                  <v-list-item prepend-icon="mdi-account-outline">
                    <v-list-item-title>Meu perfil</v-list-item-title>
                  </v-list-item>

                  <v-list-item prepend-icon="mdi-heart-outline">
                    <v-list-item-title>Favoritos</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>
        </v-app-bar>
      </div>
    </div>

    <div
      :class="{
        'chat-container-open': isDrawerOpen,
        'chat-container-closed': !isDrawerOpen,
      }"
    >
      <div class="chat-container">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message"
          :class="{
            'user-message': message.sender === 'user',
            'bot-message': message.sender === 'bot',
          }"
        >
          {{ message.text }}
        </div>
      </div>
    </div>

    <div>
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

    <div>
      <v-textarea
        class="inputMessage"
        name="input"
        variant="filled"
        label="Type a message"
        auto-grow
        v-model="input"
      >
        <template #append>
          <v-btn @click="handleSend" class="mr-2" color="primary">
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </template>
      </v-textarea>
    </div>

    <!--Waves end-->
  </div>
  <!--Header ends-->

  <!--Content starts-->
  <div class="content flex">
    <div class="copyright"><p>©Polaris 2023</p></div>
    <div class="copyright"><p class="ml-4">Versão: 2.0</p></div>
  </div>

  <!--Content ends-->
</template>

<style lang="scss" scoped>
.barraTop {
  height: 120px;
  transition: height 0.3s ease-in-out;
}

.barraTopOpen {
  height: auto;
  flex-direction: column-reverse;
}

.barraTopClosed {
  height: 120px;
}

.chat-container-open {
  margin-left: 350px !important;
}

.chat-container-closed {
  margin-left: 165px;
  margin-top: 30px;
  width: 100%;
}

@media only screen and (max-width: 600px) {
  .logo {
    margin-top: -50px;
    margin-left: 150px;
  }
  .waves {
    height: 5px !important;
  }
  .barraTopOpen {
    height: auto;
    flex-direction: column-reverse;
  }

  .barraTopClosed {
    height: 120px;
  }

  .chat-container-open {
    margin-top: 130px;
    margin-left: 190px !important;
  }

  .chat-container-closed {
    margin-left: 45px;
    margin-top: 25px;
    width: 110%;
  }
  .barraTop {
    height: auto;
    flex-direction: column-reverse;
  }

  .barra {
    width: 85% !important;
    height: auto;
  }

  .chat-container {
    margin-left: -150px;
  }

  .inputMessage {
    height: 70px;
  }
}

.barra {
  width: 155px;
  height: 70px;
  background-color: #ffffff00;
}

.copyright {
  margin-bottom: 10px;
}
.chat-container {
  max-height: 450px;
  overflow-y: auto;
  padding: 16px;
  height: 150vh;
  width: 100%;
  margin: 0;
  padding: 0;
  transition: margin-left 0.3s ease-in-out;
}

.message {
  padding: 8px;
  margin-bottom: 8px;
  max-width: 70%;
  word-wrap: break-word;
}

.user-message {
  text-align: right;
  background-color: #576e6888;
  color: white;
  border-radius: 8px 8px 0 8px;
}

.bot-message {
  text-align: left;
  background-color: #233a4d;
  color: white;
  border-radius: 8px 8px 8px 0;
}
.inputMessage {
  height: 100px;
}
.btnDark {
  position: fixed;
  top: 8px;
  left: 45px;
  z-index: 1005;
}

.folha {
  // color: "red";
  fill: green;
  // fill: rgba(63, 76, 119, 0.8);
}

.ct {
  height: 100vh;
  // background: radial-gradient(#653d84, #332042);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login {
  display: flex;
  // width: 380px;
  // min-width: 300px;
}

p {
  letter-spacing: 1px;
  font-size: 14px;
  // color: #333333;
}

.header {
  margin-top: -30px;
  position: relative;
  text-align: center;
  background: linear-gradient(
    60deg,
    rgba(84, 58, 183, 1) 0%,
    rgba(0, 172, 193, 1) 100%
  );
  color: white;
}

.dark .header {
  background: linear-gradient(
    112.1deg,
    rgb(32, 38, 57) 11.4%,
    rgb(63, 76, 119) 70.2%
  );
}

.logo {
  width: 50px;
  fill: white;
  padding-right: 15px;
  display: inline-block;
  vertical-align: middle;
}

.inner-header {
  height: 25vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

.flex {
  /*Flexbox for containers*/
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.waves {
  position: relative;
  // margin-top: 150px;
  width: 100%;
  height: 15vh;
  margin-bottom: -7px;
  /*Fix for safari gap*/
  min-height: 100px;
  max-height: 150px;
}

.content {
  position: relative;
  height: 10vh;
  text-align: center;
  background-color: white;
}

.dark .content {
  background-color: #38446b;
  height: 85px;
}

/* Animation */

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

/*Shrinking for mobile*/
// @media (max-width: 768px) {
//   .waves {
//     height: 40px;
//     min-height: 40px;
//   }
//   .content {
//     height: 30vh;
//   }
//   h1 {
//     font-size: 24px;
//   }
// }
</style>
