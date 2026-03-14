<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import { chatState, chatActions, groupedConversations } from '../../composables/useChat';

const renameDialog = ref(false);
const renameTarget = ref<{ id: string; name: string } | null>(null);
const renameName = ref('');

const deleteDialog = ref(false);
const deleteTarget = ref<string | null>(null);
const { mdAndDown } = useDisplay();

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
    app
    :temporary="mdAndDown"
    :scrim="mdAndDown"
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
        v-if="mdAndDown"
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
              <v-list density="compact" bg-color="#2a2a2a" rounded="lg" class="context-menu">
                <v-list-item @click="openRename(conv)" prepend-icon="mdi-pencil-outline">
                  <v-list-item-title>Renomear</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openDelete(conv.id)" prepend-icon="mdi-delete-outline" class="text-error">
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
  background-color: #171717 !important;
  border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
}
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 14px 12px 10px;
  gap: 8px;
}
.sidebar-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e0e0e0;
  letter-spacing: 0.2px;
}
.sidebar-header :deep(.v-btn) {
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  background: transparent !important;
  box-shadow: none !important;
  color: #999 !important;
}
.sidebar-header :deep(.v-btn:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
}
.sidebar-list {
  background: transparent !important;
  padding: 0 !important;
}
.sidebar-group-title {
  font-size: 0.7rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666 !important;
  padding: 16px 16px 6px !important;
  min-height: unset !important;
}
.sidebar-item {
  border-radius: 8px !important;
  margin: 1px 8px !important;
  padding: 0 8px !important;
  min-height: 36px !important;
  color: #b0b0b0 !important;
  transition: background 0.15s !important;
}
.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  color: #f0f0f0 !important;
}
.sidebar-item :deep(.v-list-item__append) {
  opacity: 0;
  transition: opacity 0.15s;
}
.sidebar-item:hover :deep(.v-list-item__append) {
  opacity: 1;
}
.sidebar-item :deep(.v-list-item__append .v-btn) {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  border-radius: 6px !important;
  background: transparent !important;
  box-shadow: none !important;
  color: #999 !important;
}
.sidebar-item :deep(.v-list-item__append .v-btn:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
.sidebar-item-title {
  font-size: 0.84rem !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
}
.sidebar-item.v-list-item--active {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
.sidebar-item.v-list-item--active :deep(.v-list-item__append) {
  opacity: 1;
}
.sidebar-empty {
  padding: 24px 16px;
  text-align: center;
  color: #555;
  font-size: 0.84rem;
}
</style>
