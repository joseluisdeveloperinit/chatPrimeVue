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
        optionLabel="name"
        :listStyle="{ 
          'max-height': 'calc(100vh - 180px)',
          'overflow-y': 'auto'
        }"
        class="users-list"
      >
        <template #option="slotProps">
          <div class="user-item" @click="openChat(slotProps.option)">
 
            <span class="user-name">{{ slotProps.option.name }}</span>
    
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
import { ref, computed } from 'vue';
import Sidebar from 'primevue/sidebar';
import ListBox from 'primevue/listbox';
import Button from 'primevue/button';

const emit = defineEmits(['open-chat']);

const sidebarVisible = ref(false);
const selectedUser = ref(null);

const onlineUsers = ref([
  { id: 1, name: 'Usuario 1', avatar: 'url_avatar1', status: 'online' },
  { id: 2, name: 'Usuario 2', avatar: 'url_avatar2', status: 'online' },
  { id: 3, name: 'Usuario 3', avatar: 'url_avatar3', status: 'online' },
  { id: 4, name: 'Usuario 4', avatar: 'url_avatar4', status: 'online' },
  { id: 5, name: 'Usuario 5', avatar: 'url_avatar5', status: 'online' },
  { id: 6, name: 'Usuario 6', avatar: 'url_avatar6', status: 'online' },
]);

const getStatusSeverity = (status) => {
  const statusMap = {
    online: 'success',
    away: 'warning',
    busy: 'danger',
    offline: 'secondary'
  };
  return statusMap[status] || 'info';
};

const openChat = (user) => {
  if (user.status === 'offline') return;
  
  emit('open-chat', user);
  sidebarVisible.value = false;
};

const onSidebarHide = () => {
  selectedUser.value = null;
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