<template>
    <div class="card">
        <ScrollPanel style="width: 100%; height: 100%">
            <Message 
                :messages="messages" 
                :currentUserId="currentUserId"
                class="message-container"
            />
        </ScrollPanel>
    </div>
</template>

<script setup>
import Message from '@/components/Message.vue';

defineProps({
    messages: {
        type: Array,
        required: true
    },
    currentUserId: {
        type: Number,
        required: true
    }
});
</script>

<style scoped>
.card {
    height: 100%;
}

.message-container {
    padding: 1rem;
    /* Eliminamos el height fijo */
}
</style>