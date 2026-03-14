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

const clearCacheDialog = ref(false);

const confirmClearCache = async () => {
  localStorage.clear();
  const dbs = await indexedDB.databases();
  for (const db of dbs) {
    if (db.name) indexedDB.deleteDatabase(db.name);
  }
  clearCacheDialog.value = false;
  window.location.reload();
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
      <v-tooltip text="Nova conversa" location="bottom">
        <template #activator="{ props: tip }">
          <v-btn
            v-bind="tip"
            icon
            size="small"
            variant="text"
            @click="chatActions.createNewChat()"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <span class="sidebar-title">Conversas</span>
      <v-spacer />
      <v-menu location="bottom end" :close-on-content-click="true">
        <template #activator="{ props: menuProps }">
          <v-tooltip text="Configurações" location="bottom">
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="{ ...menuProps, ...tip }"
                icon
                size="small"
                variant="text"
              >
                <v-icon size="18">mdi-cog-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
        <v-list density="compact" bg-color="#2a2a2a" rounded="lg" class="settings-menu">
          <v-list-item @click="clearCacheDialog = true" prepend-icon="mdi-delete-sweep">
            <v-list-item-title>Limpar dados</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-tooltip text="Fechar" location="bottom" v-if="mdAndDown">
        <template #activator="{ props: tip }">
          <v-btn
            v-bind="tip"
            icon
            size="small"
            variant="text"
            @click="chatState.sidebarOpen = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
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

    <!-- Clear cache dialog -->
    <v-dialog v-model="clearCacheDialog" max-width="380">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon size="22" class="mr-2" color="#f44336">mdi-alert-circle-outline</v-icon>
          Limpar todos os dados?
        </v-card-title>
        <v-card-text class="dialog-text">
          Todas as conversas, mensagens e configurações serão apagadas permanentemente. Essa ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" class="dialog-btn" @click="clearCacheDialog = false">Cancelar</v-btn>
          <v-btn variant="flat" class="dialog-btn dialog-btn--danger" @click="confirmClearCache">Limpar tudo</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Rename dialog -->
    <v-dialog v-model="renameDialog" max-width="380">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon size="22" class="mr-2" color="#999">mdi-pencil-outline</v-icon>
          Renomear conversa
        </v-card-title>
        <v-card-text class="dialog-text" style="padding-bottom: 8px !important;">
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
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" class="dialog-btn" @click="renameDialog = false">Cancelar</v-btn>
          <v-btn variant="flat" class="dialog-btn" style="background-color: #fff !important; color: #212121 !important;" @click="confirmRename">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete dialog -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon size="22" class="mr-2" color="#f44336">mdi-alert-circle-outline</v-icon>
          Excluir conversa?
        </v-card-title>
        <v-card-text class="dialog-text">Essa ação não pode ser desfeita.</v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" class="dialog-btn" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn variant="flat" class="dialog-btn dialog-btn--danger" @click="confirmDelete">Excluir</v-btn>
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

/* Settings menu */
.settings-menu :deep(.v-list-item) {
  color: #e0e0e0 !important;
  font-size: 0.84rem !important;
  min-height: 38px !important;
}
.settings-menu :deep(.v-list-item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

/* Dialog theme */
.dialog-card {
  background-color: #2a2a2a !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px !important;
  padding: 8px !important;
}
.dialog-title {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: #f0f0f0 !important;
  display: flex !important;
  align-items: center !important;
  padding: 16px 16px 8px !important;
}
.dialog-text {
  font-size: 0.875rem !important;
  color: #999 !important;
  line-height: 1.5 !important;
  padding: 8px 16px 16px !important;
}
.dialog-actions {
  padding: 8px 16px 12px !important;
}
.dialog-btn {
  text-transform: none !important;
  font-size: 0.84rem !important;
  letter-spacing: 0 !important;
  border-radius: 8px !important;
  padding: 0 16px !important;
  color: #b0b0b0 !important;
}
.dialog-btn:hover {
  background: rgba(255, 255, 255, 0.06) !important;
}
.dialog-btn--danger {
  background-color: #d32f2f !important;
  color: #fff !important;
}
.dialog-btn--danger:hover {
  background-color: #b71c1c !important;
}
</style>
