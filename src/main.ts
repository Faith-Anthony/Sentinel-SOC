/**
 * Application entry point
 * Initializes Vue 3 app with Pinia, Vue Router, and Tailwind CSS
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './index.css'

// Create app instance
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Mount app
app.mount('#app')
