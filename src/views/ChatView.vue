<template>
    <div class="chat-container">
        <Advertise></Advertise>

        <SideBar class="sidebar-component" :currentUserId="currentUserId" :onlineUsers="onlineUsers"
            @open-chat="openPrivateChat" />

        <div class="main-content">
            <TabView v-model:activeIndex="activeTab" class="custom-tabview">
                <TabPanel v-for="tab in allTabs" :key="tab.id">
                    <template #header>
                        <div class="tab-header" style="position: relative; padding-right: 24px;">
                            <span>{{ tab.title }}</span>
                            <Button v-if="!tab.isGeneral" icon="pi pi-times"
                                class="p-button-text p-button-rounded p-button-sm close-btn"
                                @click.stop="closeTab(tab.id)" />
                        </div>
                    </template>
                    <div class="chat-content">
                        <div class="chat-panel">
                            <div class="messages-container">
                                <Message :messages="tab.messages" :currentUserId="currentUserId"
                                    :ref="el => setMessageRef(el, tab.id)" />
                            </div>
                            <BottomTab v-if="tab.isGeneral" @send-message="sendPublicMessage" class="bottom-tab"
                                @send-image="handleImageUpload" />
                            <BottomTab v-else @send-message="(msg) => sendPrivateMessage(tab.userId, msg)"
                                class="bottom-tab" @send-image="(file) => sendPrivateImage(tab.userId, file)" />
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </div>

        <Advertise></Advertise>

        <Dialog v-model:visible="nicknameDialogVisible" header="Cambiar Nickname" :modal="true"
            :style="{ width: '350px' }">
            <div class="p-fluid">
                <div class="field">
                    <InputText v-model="newNickname" placeholder="Nuevo nickname" autofocus />
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" @click="nicknameDialogVisible = false"
                    class="p-button-text" />
                <Button label="Guardar" icon="pi pi-check" @click="saveNickname" autofocus />
            </template>
        </Dialog>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Message from '@/components/Message.vue';
import BottomTab from '@/components/BottomTab.vue';
import SideBar from '@/components/SideBar.vue';
import Advertise from '@/components/Advertise.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { BASE_URL } from '@/constants/BASE_URL';

export default {
    components: {
        Message,
        BottomTab,
        TabView,
        TabPanel,
        SideBar,
        Advertise,
        Button,
        Dialog,
        InputText
    },
    setup() {
        const activeTab = ref(0);
        const currentUserId = ref('');
        const publicMessages = ref([]);
        const privateChats = ref([]);
        const onlineUsers = ref([]);
        const nicknameDialogVisible = ref(false);
        const newNickname = ref('');
        const socket = ref(null);
        const messageRefs = ref({});

        // Computed para combinar todas las pestañas
        const allTabs = computed(() => {
            return [
                {
                    id: 'general',
                    title: 'General',
                    messages: publicMessages.value,
                    isGeneral: true
                },
                ...privateChats.value.map(chat => ({
                    id: chat.userId,
                    title: chat.userName,
                    userId: chat.userId,
                    messages: chat.messages,
                    isGeneral: false
                }))
            ];
        });

        // Configurar referencias de los mensajes
        const setMessageRef = (el, tabId) => {
            if (el) {
                messageRefs.value[tabId] = el;
            }
        };

        // WebSocket connection
        const connectWebSocket = () => {
            const wsUrl = 'ws://localhost:8080/chat';

            socket.value = new WebSocket(wsUrl);

            socket.value.onopen = () => {
                console.log('WebSocket connected');
            };

            socket.value.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleIncomingMessage(message);
            };

            socket.value.onclose = () => {
                console.log('WebSocket disconnected');
                setTimeout(connectWebSocket, 5000);
            };

            socket.value.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        };

        // Manejo de mensajes entrantes
        const handleIncomingMessage = (message) => {
            console.log("Mensaje recibido:", message);

            switch (message.type) {
                case 'id':
                    currentUserId.value = message.message;
                    loadInitialData();
                    break;

                case 'public':
                    publicMessages.value.push({
                        type: 'public',
                        content: message.message,
                        senderId: message.from,
                        senderName: message.nickname || message.from,
                        timestamp: new Date()
                    });
                    scrollToBottom('general');
                    break;

                case 'private':
                    addPrivateMessage(message.from, {
                        type: 'private',
                        content: message.message,
                        senderId: message.from,
                        senderName: message.nickname || message.from,
                        timestamp: new Date()
                    });
                    scrollToBottom(message.from);
                    break;

                case 'image':
                    if (message.to) {
                        // Imagen privada
                        addPrivateMessage(message.from, {
                            type: 'image',
                            imageData: message.imageData,
                            imageType: message.imageType,
                            senderId: message.from,
                            senderName: message.nickname || message.from,
                            timestamp: new Date()
                        });
                        scrollToBottom(message.from);
                    } else {
                        // Imagen pública
                        publicMessages.value.push({
                            type: 'image',
                            imageData: message.imageData,
                            imageType: message.imageType,
                            senderId: message.from,
                            senderName: message.nickname || message.from,
                            timestamp: new Date()
                        });
                        scrollToBottom('general');
                    }
                    break;

                case 'join':
                case 'leave':
                    publicMessages.value.push({
                        type: 'system',
                        content: message.message,
                        senderName: message.nickname || 'System',
                        timestamp: new Date()
                    });
                    scrollToBottom('general');
                    break;

                case 'users-updated':
                    try {
                        onlineUsers.value = JSON.parse(message.message);
                    } catch (e) {
                        console.error("Error parsing users:", e);
                    }
                    break;

                default:
                    console.warn('Tipo de mensaje no reconocido:', message);
            }
        };

        // Cerrar pestaña
        const closeTab = (tabId) => {
            if (tabId === 'general') return;

            const index = privateChats.value.findIndex(c => c.userId === tabId);
            if (index !== -1) {
                privateChats.value.splice(index, 1);

                // Ajustar el índice activo si cerramos la pestaña actual
                if (activeTab.value > index + 1) {
                    activeTab.value = Math.max(0, activeTab.value - 1);
                } else if (activeTab.value === index + 1) {
                    activeTab.value = 0; // Volver a General
                }
            }
        };

        // Abrir chat privado
        const openPrivateChat = (userId) => {
            const user = onlineUsers.value.find(u => u.id === userId);
            if (!user) return;

            const existingChat = privateChats.value.find(c => c.userId === userId);
            if (!existingChat) {
                privateChats.value.push({
                    userId: userId,
                    userName: user.nickname || user.id,
                    messages: []
                });
            }

            // Activar la pestaña del chat (sumamos 1 por la pestaña General)
            activeTab.value = privateChats.value.findIndex(c => c.userId === userId) + 1;
        };

        // Scroll al final del chat
        const scrollToBottom = (tabId) => {
            nextTick(() => {
                const ref = messageRefs.value[tabId];
                if (ref?.$el) {
                    ref.$el.scrollTop = ref.$el.scrollHeight;
                }
            });
        };

        const loadInitialData = async () => {
            try {
                // Obtener mensajes públicos
                const publicRes = await fetch(`${BASE_URL}/chat/messages`);
                const publicMsgs = await publicRes.json();
                publicMessages.value = publicMsgs.map(msg => ({
                    type: 'public',
                    content: msg.message,
                    senderId: msg.from,
                    senderName: msg.nickname || msg.from,
                    timestamp: new Date(msg.timestamp || Date.now())
                }));

                // Obtener usuarios conectados
                const usersRes = await fetch(`${BASE_URL}/chat/users`);
                onlineUsers.value = await usersRes.json();

                scrollToBottom('general');
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
            }
        };

        const sendPublicMessage = (messageContent) => {
            if (socket.value?.readyState === WebSocket.OPEN && messageContent.trim()) {
                const message = {
                    type: 'public',
                    message: messageContent.trim()
                };
                socket.value.send(JSON.stringify(message));
            }
        };

        const sendPrivateMessage = (userId, messageContent) => {
            if (socket.value?.readyState === WebSocket.OPEN && messageContent.trim()) {
                const message = {
                    type: 'private',
                    to: userId,
                    message: messageContent.trim()
                };
                socket.value.send(JSON.stringify(message));
            }
        };

        // Manejar subida de imagen
        const handleImageUpload = async (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result.split(',')[1];
                const fileType = file.type.split('/')[1];

                if (socket.value?.readyState === WebSocket.OPEN) {
                    socket.value.send(JSON.stringify({
                        type: 'image',
                        imageData: base64Data,
                        imageType: fileType
                    }));
                }
            };
            reader.readAsDataURL(file);
        };

        // Enviar imagen privada
        const sendPrivateImage = (userId, file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result.split(',')[1];
                const fileType = file.type.split('/')[1];

                if (socket.value?.readyState === WebSocket.OPEN) {
                    socket.value.send(JSON.stringify({
                        type: 'image',
                        to: userId,
                        imageData: base64Data,
                        imageType: fileType
                    }));
                }
            };
            reader.readAsDataURL(file);
        };

        // Añadir mensaje privado
        const addPrivateMessage = (fromUserId, message) => {
            let chat = privateChats.value.find(c => c.userId === fromUserId);

            if (!chat) {
                const user = onlineUsers.value.find(u => u.id === fromUserId);
                if (!user) {
                    chat = {
                        userId: fromUserId,
                        userName: message.senderName || fromUserId,
                        messages: []
                    };
                } else {
                    chat = {
                        userId: fromUserId,
                        userName: user.nickname || user.id,
                        messages: []
                    };
                }
                privateChats.value.push(chat);
            }

            chat.messages.push(message);

            // Activar la pestaña si no está activa
            const tabIndex = privateChats.value.findIndex(c => c.userId === fromUserId) + 1;
            if (activeTab.value !== tabIndex) {
                activeTab.value = tabIndex;
            }
        };

        // Cambiar nickname
        const saveNickname = () => {
            if (newNickname.value.trim() && socket.value?.readyState === WebSocket.OPEN) {
                socket.value.send(JSON.stringify({
                    type: 'nickname',
                    nickname: newNickname.value.trim()
                }));
                nicknameDialogVisible.value = false;
                newNickname.value = '';
            }
        };

        // Ciclo de vida
        onMounted(() => {
            connectWebSocket();
        });

        onUnmounted(() => {
            if (socket.value) {
                socket.value.close();
            }
        });

        return {
            activeTab,
            currentUserId,
            publicMessages,
            privateChats,
            onlineUsers,
            nicknameDialogVisible,
            newNickname,
            allTabs,
            sendPublicMessage,
            sendPrivateMessage,
            handleImageUpload,
            sendPrivateImage,
            openPrivateChat,
            closeTab,
            saveNickname,
            setMessageRef
        };
    }
};
</script>

<style scoped>
.close-btn {
    position: absolute;
    bottom: 0.8rem;
    right: 1px;
    z-index: 10;
}
.messages-container {
    flex: 1;    
    height: 100%;
}

.tab-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    position: relative;
    padding-right: 24px;

}

.tab-header button {
    margin-left: 0.5rem;
    color: var(--text-color-secondary);
    transition: color 0.2s;
}

.tab-header button:hover {
    color: var(--text-color);
}

.chat-container {
    display: flex;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.sidebar-component {
    position: relative;
}

.chat-content {
    display: flex;
    flex-direction: column;
}

.bottom-tab {
    position: relative; /* Cambia de absolute/fixed a relative */
}

.chat-panel {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 150px); /* Ajusta según tu layout */
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
}

:deep(.p-tabview-nav) {
    flex-wrap: nowrap;
    width: max-content;
    padding-bottom: 4px;
}

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

@media (max-width: 768px) {
    :deep(.p-tabview-nav) {
        padding-bottom: 8px;
    }

    :deep(.p-tabview-nav-content)::-webkit-scrollbar {
        height: 6px;
    }
}
</style>