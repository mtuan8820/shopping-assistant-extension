<template>
  <div class="panel">
    <header>
      <h1>Shopping Assistant</h1>
    </header>

    <main>
      <button @click="scanPage" :disabled="loading">
        {{ loading ? 'Scanning…' : 'Scan Page' }}
      </button>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="product" class="product">
        <p class="title">{{ product.title }}</p>
        <p v-if="product.price" class="price">{{ product.price }}</p>
        <p v-else class="no-price">No price found</p>
        <a :href="product.url" target="_blank" class="url">{{ product.url }}</a>
      </div>

      <p v-else-if="!loading && scanned" class="empty">No product info found on this page.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProductInfo } from '../shared/types'

const loading = ref(false)
const scanned = ref(false)
const product = ref<ProductInfo | null>(null)
const error = ref<string | null>(null)

async function scanPage() {
  loading.value = true
  error.value = null
  product.value = null
  scanned.value = false

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) throw new Error('No active tab')

    const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PRODUCT_INFO' })
    product.value = response.product
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to scan page'
  } finally {
    loading.value = false
    scanned.value = true
  }
}
</script>

<style scoped>
.panel {
  font-family: system-ui, sans-serif;
  padding: 16px;
  min-width: 280px;
}

header h1 {
  font-size: 1.1rem;
  margin: 0 0 16px;
}

button {
  width: 100%;
  padding: 8px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.product {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  font-weight: 600;
  font-size: 0.95rem;
}

.price {
  color: #1a73e8;
  font-size: 1.1rem;
  font-weight: 700;
}

.no-price {
  color: #888;
  font-size: 0.85rem;
}

.url {
  font-size: 0.75rem;
  color: #555;
  word-break: break-all;
}

.error {
  margin-top: 12px;
  color: #d93025;
  font-size: 0.85rem;
}

.empty {
  margin-top: 12px;
  color: #888;
  font-size: 0.85rem;
}
</style>
