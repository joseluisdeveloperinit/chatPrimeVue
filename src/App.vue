<template>
  <ChatView />
</template>

<script>
import ChatView from './views/ChatView.vue'

export default {
  components: {
    ChatView
  }
}
</script>

<style>
/* Estilos globales */
body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
}

#app {
    height: 100vh;
    display: flex;
    flex-direction: column;
}
</style>