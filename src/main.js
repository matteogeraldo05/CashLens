/*
	App bootstrap file: creates the Vue app instance, wires Pinia + Vue Router,
	and mounts the app into the #app element in index.html.
*/
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')