<script setup lang="ts">
import { ref } from 'vue';
import { chatState, chatActions, groupedConversations } from '../../composables/useChat';

const renameDialog = ref(false);
const renameTarget = ref<{ id: string; name: string } | null>(null);
const renameName = ref('');

const deleteDialog = ref(false);
const deleteTarget = ref<string | null>(null);

const openRename = (conv: { id: string; name: string }) => {
  renameTarget.value = conv;
  renameName.value = conv.name;
  renameDialog.value = true;
};

const confirmRename = async () => {
  if (renameTarget.value && renameName.value.trim()) {
    await chatActions.renameConversation(renameTarget.value.id, renameName.value.trim());
  }
  renameDialog.value = false;
};

const openDelete = (convId: string) => {
  deleteTarget.value = convId;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (deleteTarget.value) {
    await chatActions.deleteConversation(deleteTarget.value);
  }
  deleteDialog.value = false;
};
</script>

<template>
  <v-navigation-drawer
    v-model="chatState.sidebarOpen"
    temporary
    width="280"
    class="sidebar-drawer"
  >
    <div class="sidebar-header">
      <v-btn
        icon
        size="small"
        variant="text"
        @click="chatActions.createNewChat()"
        title="Nova conversa"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <span class="sidebar-title">Conversas</span>
      <v-spacer />
      <v-btn
        icon
        size="small"
        variant="text"
        @click="chatState.sidebarOpen = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-list density="compact" class="sidebar-list">
      <template v-for="group in groupedConversations" :key="group.title">
        <v-list-subheader class="sidebar-group-title">
          {{ group.title }}
        </v-list-subheader>
        <v-list-item
          v-for="conv in group.conversations"
          :key="conv.id"
          :active="conv.id === chatState.currentConvId"
          class="sidebar-item"
          @click="chatActions.loadConversation(conv.id)"
        >
          <v-list-item-title class="sidebar-item-title">
            {{ conv.name }}
          </v-list-item-title>
          <template #append>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  size="x-small"
                  variant="text"
                  @click.stop
                >
                  <v-icon size="16">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click="openRename(conv)">
                  <v-list-item-title>Renomear</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openDelete(conv.id)" class="text-error">
                  <v-list-item-title>Excluir</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-list-item>
      </template>

      <div v-if="chatState.conversations.length === 0" class="sidebar-empty">
        Nenhuma conversa ainda
      </div>
    </v-list>

    <!-- Rename dialog -->
    <v-dialog v-model="renameDialog" max-width="360">
      <v-card class="pa-4">
        <v-card-title class="text-h6">Renomear conversa</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="renameName"
            label="Nome"
            variant="outlined"
            density="compact"
            hide-details
            autofocus
            @keydown.enter="confirmRename"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="renameDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="tonal" @click="confirmRename">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete dialog -->
    <v-dialog v-model="deleteDialog" max-width="360">
      <v-card class="pa-4">
        <v-card-title class="text-h6">Excluir conversa?</v-card-title>
        <v-card-text>Essa ação não pode ser desfeita.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="tonal" @click="confirmDelete">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar-drawer {
  background-color: #1a1a1a !important;
}
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 12px 12px 8px;
  gap: 8px;
}
.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #f5f5f5;
}
.sidebar-list {
  background: transparent !important;
}
.sidebar-group-title {
  font-size: 0.7rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888 !important;
  padding: 8px 16px 4px !important;
}
.sidebar-item {
  border-radius: 8px;
  margin: 0 8px;
}
.sidebar-item-title {
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-empty {
  padding: 24px 16px;
  text-align: center;
  color: #666;
  font-size: 0.85rem;
}
</style>
