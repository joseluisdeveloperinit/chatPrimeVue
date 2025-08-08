import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';


const app = createApp(App);
app.use(PrimeVue, {
        unstyled: false, 
    autoImport: true,
    theme: {
        preset: Aura
    }
});
app.mount('#app'); // Añade esta línea al final
