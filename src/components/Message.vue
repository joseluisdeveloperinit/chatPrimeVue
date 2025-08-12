<template>
    <div class="chat-container">
        <div v-for="msg in processedMessages" :key="msg.id" class="message" :class="{
            'message--own': msg.senderId === currentUserId,
            'message--system': msg.type === 'system',
            'message--image': msg.type === 'image'
        }">
            <div v-if="msg.type === 'image'" class="image-message">
                <img :src="'data:image/' + msg.imageType + ';base64,' + msg.imageData" alt="Imagen enviada">
                <div class="image-meta">
                    <span class="sender">{{ msg.senderName }}</span>
                    <span class="time">{{ formatTime(msg.timestamp) }}</span>
                </div>
            </div>

            <template v-else>
                <div class="message-meta">
                    <span class="sender">{{ msg.senderName }}</span>
                    <span class="time">{{ formatTime(msg.timestamp) }}</span>
                </div>
                <div class="message-content">
                    {{ msg.content }}
                </div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        messages: { type: Array, required: true },
        currentUserId: { type: String, required: true }
    },
    computed: {
        processedMessages() {
            return this.messages.map(msg => {
                return {
                    id: msg.id || `${msg.timestamp}-${msg.senderId}-${msg.type}`,
                    type: msg.type,
                    content: msg.content || msg.message,
                    senderId: msg.senderId || msg.from,
                    senderName: msg.senderName || msg.nickname || 'Unknown',
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                    imageData: msg.imageData,
                    imageType: msg.imageType
                };
            });
        }
    },
    methods: {
        formatTime(ts) {
            if (!ts) return '';
            const date = ts instanceof Date ? ts : new Date(ts);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
};
</script>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    height: 100%;
    overflow-y: auto;
    background: #2d1e1e;
    overflow-y: auto; /*este es el bueno para quitar el doble scroll */
}

.message {
    background: #2d2d3d;
    color: #ffffff;
    padding: 12px 16px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    word-break: break-word;
}

.message--own {
    background: #4a3a78;
    /* margin-left: auto; */
    border-bottom-right-radius: 4px;
}

.message--system {
    background: #333344;
    margin: 0 auto;
    text-align: center;
    font-style: italic;
    color: #a0a0c0;
}

.message--image {
    background: transparent;
    padding: 0;
    max-width: 80%;
}

.message-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 0.8rem;
    color: #a0a0c0;
}

.sender {
    font-weight: 600;
    color: #6ee7b7;
}

.time {
    color: #8888aa;
    margin-left: 10px;
}

.message-content {
    font-size: 0.95rem;
    line-height: 1.4;
}

.image-message {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.image-message img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid #3a3a4d;
}

.image-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #a0a0c0;
    padding: 0 4px;
}

</style>