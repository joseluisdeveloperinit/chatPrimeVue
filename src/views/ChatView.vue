<template>
    <div class="chat-container">
        <Advertise></Advertise>

        <SideBar class="sidebar-component" @open-chat="addTab($event.id, $event.name)" />
        <div class="main-content">
            <TabView v-model:activeIndex="activeTab" class="custom-tabview">
                <TabPanel v-for="tab in tabs" :key="tab.id">
                    <template #header>
                        <div class="tab-header">
                            <span>{{ tab.title }}</span>
                            <Button icon="pi pi-times" class="p-button-text p-button-rounded p-button-sm"
                                @click.stop="closeTab(tab.id)" />
                        </div>
                    </template>
                    <div class="chat-content">
                        <div class="chat-panel">
                            <ChatPanel :messages="tab.messages" />
                        </div>
                        <div class="bottom-tab">
                            <BottomTab @send-message="(msg) => sendMessage(tab.id, msg)" />
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </div>
        <Advertise></Advertise>
    </div>
</template>

<script>
import { ref } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ChatPanel from '@/components/ChatPanel.vue';
import BottomTab from '@/components/BottomTab.vue';
import SideBar from '@/components/SideBar.vue';
import Advertise from '@/components/Advertise.vue';
import Button from 'primevue/button';

export default {
    components: {
        ChatPanel,
        BottomTab,
        TabView,
        TabPanel,
        SideBar,
        Advertise,
        Button
    },
    setup() {
        const activeTab = ref(0);
        const tabs = ref([
            {
                id: 'general',
                title: 'General',
                messages: []
            }
        ]);

        const sendMessage = (tabId, message) => {
            const tab = tabs.value.find(t => t.id === tabId);
            if (tab) {
                tab.messages.push({
                    content: message,
                    timestamp: new Date(),
                    type: 'sent'
                });
            }
        };

        const addTab = (tabId, tabTitle) => {
            if (!tabs.value.some(tab => tab.id === tabId)) {
                tabs.value.push({
                    id: tabId,
                    title: tabTitle,
                    messages: []
                });
                activeTab.value = tabs.value.length - 1;
            } else {
                activeTab.value = tabs.value.findIndex(tab => tab.id === tabId);
            }
        };

        const closeTab = (tabId) => {
            if (tabId === 'general') return; // Prevenir cierre de General
            const index = tabs.value.findIndex(tab => tab.id === tabId);
            if (index !== -1) {
                tabs.value.splice(index, 1);

                // Ajustar el índice activo si cerramos la pestaña actual
                if (activeTab.value >= index) {
                    activeTab.value = Math.max(0, activeTab.value - 1);
                }
            }
        };

        return {
            activeTab,
            tabs,
            sendMessage,
            addTab,
            closeTab
        };
    }
}
</script>

<style scoped>
.tab-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
}

.tab-header button {
    margin-left: 0.5rem;
    color: var(--text-color-secondary);
    transition: color 0.2s;
}

.tab-header button:hover {
    color: var(--text-color);
}

/* Mantén tus estilos existentes */
.chat-container {
    display: flex;
    height: 100vh;
    position: relative;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.sidebar-component {
    position: relative;
    height: 100%;
}

.chat-content {
    transition: margin-left 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    align-items: center;
}

.bottom-tab {
    position: fixed;
    bottom: 0;
    z-index: 1000;
    width: 100%;
}

.chat-panel {
    width: 70%;
    flex: 1;
}

:deep(.custom-tabview) {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

:deep(.p-tabview-panels) {
    flex: 1;
    padding: 0;
}


:deep(.p-tabview-nav-container) {
    position: relative;
    overflow: hidden;
}

:deep(.p-tabview-nav-content) {
    overflow-x: auto;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
    /* Para scroll suave en iOS */
}

:deep(.p-tabview-nav) {
    flex-wrap: nowrap;
    width: max-content;
    padding-bottom: 4px;
    /* Espacio para scroll */
}

/* Estilos para la barra de scroll */
:deep(.p-tabview-nav-content)::-webkit-scrollbar {
    height: 4px;
}

:deep(.p-tabview-nav-content)::-webkit-scrollbar-track {
    background: var(--surface-b);
}

:deep(.p-tabview-nav-content)::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 2px;
}

/* Estilos para móvil */
@media (max-width: 768px) {
    :deep(.p-tabview-nav) {
        padding-bottom: 8px;
    }

    :deep(.p-tabview-nav-content)::-webkit-scrollbar {
        height: 6px;
    }
}
</style>