import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '~/ui/App.vue'
import 'virtual:uno.css'
import '~/styles/base.css'

createApp(App).use(createPinia()).mount('#app')
