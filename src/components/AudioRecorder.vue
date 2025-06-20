import { ref } from 'vue';
import axios from 'axios';
import { state } from '../pages/chatui/chatui';

const isRecording = ref(false);
const loading = ref(false);

let mediaRecorder: MediaRecorder;
let stream: MediaStream | null = null; // 👈 novo
let chunks: Blob[] = [];

const toggleRecording = async () => {
  console.log("🎯 toggleRecording foi acionado!");
  if (!isRecording.value) {
    chunks = [];

    console.log("🎤 Solicitando permissão para microfone...");
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("✅ Permissão concedida, iniciando gravação");

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        console.log("📥 Chunk recebido:", e.data.size);
        chunks.push(e.data);
      } else {
        console.warn("⚠️ Chunk vazio ignorado");
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });

      // 🔥 Libera o microfone aqui
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        console.log("🎧 Microfone liberado!");
      }

      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("session_id", state.idChat);

      const tempUrl = URL.createObjectURL(audioBlob);

      const userMessage = {
        id: state.messages.length + 1,
        text: "",
        sender: "user",
        timestamp: new Date(),
        audioUrl: tempUrl,
      };
      state.messages = [...state.messages, userMessage];

      try {
        loading.value = true;

        const audioUrl = import.meta.env.VITE_API_AUDIO_URL;
        const res = await axios.post(
          `${audioUrl}/audio-inference/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 640000,
          },
        );

        const resposta = res.data.resposta;
        const ttsUrl = res.data.tts_audio_url;

        const botMessage = {
          id: state.messages.length + 1,
          text: resposta,
          sender: "bot",
          timestamp: new Date(),
          audioUrl: ttsUrl,
        };
        state.messages = [...state.messages, botMessage];
      } catch (err) {
        console.error("❌ Erro ao enviar áudio:", err);
      } finally {
        loading.value = false;
        isRecording.value = false;
      }
    };

    mediaRecorder.start();
    isRecording.value = true;
    console.log("🎙️ Gravando por 5 segundos...");

    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        console.log("⏱️ Encerrando gravação...");
        mediaRecorder.stop();
      }
    }, 5000);
  }
};
