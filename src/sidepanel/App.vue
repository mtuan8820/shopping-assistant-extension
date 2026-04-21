<template>
  <div class="panel">
    <header>
      <h1>Shopping Assistant</h1>
    </header>

    <main>
      <button @click="scanPage" :disabled="loading">
        {{ loading ? loadingStatus : 'Analyze Reviews' }}
      </button>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="product" class="product">
        <p class="title">{{ product.title }}</p>
        <p v-if="product.price" class="price">{{ product.price }}</p>
        <p v-else class="no-price">No price found</p>
        <a :href="product.url" target="_blank" class="url">{{ product.url }}</a>
      </div>

      <div v-if="summary" class="summary">
        <p class="prose">{{ summary.prose }}</p>
        <p class="review-count">Based on {{ summary.reviewCount }} reviews</p>

        <div v-for="group in summary.groups" :key="group.feature" class="group">
          <p class="feature">{{ group.feature }}</p>
          <ul v-if="group.pros.length" class="pros">
            <li v-for="pro in group.pros" :key="pro">{{ pro }}</li>
          </ul>
          <ul v-if="group.cons.length" class="cons">
            <li v-for="con in group.cons" :key="con">{{ con }}</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProductInfo, ReviewSummary } from '../shared/types'
import { GoogleGenAI } from '@google/genai'
import { callGemini } from './gemini'

const loading = ref(false)
const loadingStatus = ref('')
const product = ref<ProductInfo | null>(null)
const summary = ref<ReviewSummary | null>(null)
const error = ref<string | null>(null)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

async function scanPage() {
  loading.value = true
  error.value = null
  product.value = null
  summary.value = null

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) throw new Error('No active tab')

    loadingStatus.value = 'Getting product info…'
    const infoRes = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PRODUCT_INFO' })
    if (!infoRes.product) throw new Error('No product found on this page')
    product.value = infoRes.product

    loadingStatus.value = 'Scraping reviews…'
    const reviewsRes = await chrome.tabs.sendMessage(tab.id, { type: 'GET_REVIEWS' })
    if (!reviewsRes.reviews?.length) throw new Error('No reviews found')

    loadingStatus.value = 'Summarizing…'
    summary.value = await callGemini(reviewsRes.reviews, ai)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    loading.value = false
    loadingStatus.value = ''
  }
}
</script>

<style scoped>
.panel {
  font-family: system-ui, sans-serif;
  padding: 16px;
  min-width: 300px;
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
  margin-top: 14px;
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

.summary {
  margin-top: 16px;
}

.prose {
  font-size: 0.85rem;
  color: #333;
  margin: 0 0 4px;
}

.review-count {
  font-size: 0.75rem;
  color: #888;
  margin: 0 0 12px;
}

.group {
  margin-bottom: 12px;
}

.feature {
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0 0 4px;
}

ul {
  margin: 2px 0 2px 16px;
  padding: 0;
  font-size: 0.82rem;
}

ul.pros li::marker {
  content: '✓ ';
  color: #1e8e3e;
}

ul.cons li::marker {
  content: '✗ ';
  color: #d93025;
}

.error {
  margin-top: 12px;
  color: #d93025;
  font-size: 0.85rem;
}
</style>
