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
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.message {
    background: rgb(111, 104, 173);
    color: #8a1818;
    padding: 8px 12px;
    border-radius: 10px;
    max-width: 70%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message--own {
    background: #498535;
    margin-left: auto;
    color: #8a1818;

}

.message--system {
    background: #8a1818;
    text-align: center;
    font-style: italic;
    max-width: 100%;
    color: #8a1818;

}

.message-meta {
    font-size: 0.75rem;
    color: #555;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
}

.message-content {
    font-size: 0.95rem;
}

.image-message {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.image-message img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
}

.image-meta {
    font-size: 0.75rem;
    color: #555;
    display: flex;
    justify-content: space-between;
}
</style>