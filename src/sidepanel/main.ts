import { createApp } from 'vue'
import App from './App.vue'

// Save
await chrome.storage.local.set({ claudeApiKey: 'sk-ant-...' })

// Read
const result = await chrome.storage.local.get('claudeApiKey')
console.log(result.claudeApiKey)

createApp(App).mount('#app')
