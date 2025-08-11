<template>
  <div class="sidebar-wrapper">
    <Sidebar 
      v-model:visible="sidebarVisible" 
      position="right" 
      class="users-sidebar"
      :dismissable="false"
      @hide="onSidebarHide"
    >
      <template #header>
        <div class="sidebar-header">
          <h3>Usuarios conectados ({{ onlineUsers.length }})</h3>
        </div>
      </template>

      <ListBox 
        v-model="selectedUser" 
        :options="onlineUsers" 
        optionLabel="nickname"
        :listStyle="{ 
          'max-height': 'calc(100vh - 180px)',
          'overflow-y': 'auto'
        }"
        class="users-list"
      >
        <template #option="slotProps">
          <div class="user-item" @click="openChat(slotProps.option)">
            <Avatar 
              :label="slotProps.option.nickname.charAt(0)" 
              class="user-avatar"
              :style="{ 
                'background-color': stringToColor(slotProps.option.nickname),
                'color': 'white'
              }"
            />
            <span class="user-name">{{ slotProps.option.nickname }}</span>
            <Badge 
              v-if="slotProps.option.id === currentUserId" 
              value="Tú" 
              severity="info" 
              class="status-badge"
            />
          </div>
        </template>
        <template #empty>
          <div class="empty-list">
            <i class="pi pi-users" style="font-size: 2rem"></i>
            <p>No hay usuarios conectados</p>
          </div>
        </template>
      </ListBox>
    </Sidebar>

    <Button 
      icon="pi pi-users" 
      @click="sidebarVisible = true"
      class="sidebar-toggle"
      :badge="onlineUsers.length.toString()"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import Sidebar from 'primevue/sidebar';
import ListBox from 'primevue/listbox';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';

const props = defineProps({
  onlineUsers: {
    type: Array,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['open-chat']);

const sidebarVisible = ref(false);
const selectedUser = ref(null);

const openChat = (user) => {
  if (user.id === props.currentUserId) return;
  emit('open-chat', user.id);
  sidebarVisible.value = false;
};

const onSidebarHide = () => {
  selectedUser.value = null;
};

// Función para generar color a partir de string
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
}

.users-sidebar {
  width: 320px;
  padding: 1rem;
  background: var(--surface-card);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.sidebar-header h3 {
  margin: 0;
  color: var(--text-color);
}

.close-btn {
  color: var(--text-color-secondary);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-color);
}

.users-list {
  width: 100%;
  margin-top: 1rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: var(--surface-hover);
}

.user-avatar {
  flex-shrink: 0;
}

.user-name {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
}

.status-badge {
  flex-shrink: 0;
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-color-secondary);
  text-align: center;
}

.empty-list i {
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.sidebar-toggle {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 1000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.sidebar-toggle:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 768px) {
  .users-sidebar {
    width: 280px;
  }
  
  .user-item {
    padding: 0.5rem;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .users-sidebar {
    width: 100%;
    max-width: 100vw;
  }
  
  .sidebar-toggle {
    right: 15px;
    top: 15px;
    width: 42px;
    height: 42px;
  }
}
</style>