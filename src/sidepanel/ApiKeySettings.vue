<template>
  <div class="settings">
    <h2 class="settings-title">
      <span class="icon">🔑</span> Gemini API Key
    </h2>

    <p class="hint">
      Enter your
      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">
        Google AI Studio
      </a>
      API key. It is stored only in your browser.
    </p>

    <div class="field">
      <input
        :type="visible ? 'text' : 'password'"
        v-model="draft"
        placeholder="AIza…"
        class="key-input"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter="save"
      />
      <button class="toggle-btn" @click="visible = !visible" :aria-label="visible ? 'Hide key' : 'Show key'">
        {{ visible ? '🙈' : '👁️' }}
      </button>
    </div>

    <div class="actions">
      <button class="save-btn" :disabled="!draft.trim()" @click="save">
        Save
      </button>
      <button v-if="hasSavedKey" class="clear-btn" @click="clear">
        Remove
      </button>
    </div>

    <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { saveGeminiApiKey, clearGeminiApiKey } from './storage'

const props = defineProps<{ hasSavedKey: boolean }>()
const emit = defineEmits<{
  saved: [key: string]
  cleared: []
}>()

const draft = ref('')
const visible = ref(false)
const feedback = ref('')
const feedbackType = ref<'ok' | 'err'>('ok')

async function save() {
  const key = draft.value.trim()
  if (!key) return
  try {
    await saveGeminiApiKey(key)
    feedback.value = 'Saved!'
    feedbackType.value = 'ok'
    draft.value = ''
    emit('saved', key)
  } catch {
    feedback.value = 'Failed to save key.'
    feedbackType.value = 'err'
  }
}

async function clear() {
  try {
    await clearGeminiApiKey()
    draft.value = ''
    feedback.value = 'Key removed.'
    feedbackType.value = 'ok'
    emit('cleared')
  } catch {
    feedback.value = 'Failed to remove key.'
    feedbackType.value = 'err'
  }
}

// Suppress unused-prop lint — props.hasSavedKey drives v-if in template
void props
</script>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon {
  font-size: 1rem;
}

.hint {
  font-size: 0.8rem;
  color: #555;
  margin: 0;
  line-height: 1.4;
}

.hint a {
  color: #1a73e8;
  text-decoration: none;
}
.hint a:hover {
  text-decoration: underline;
}

.field {
  display: flex;
  gap: 4px;
}

.key-input {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: monospace;
  outline: none;
  transition: border-color 0.15s;
}
.key-input:focus {
  border-color: #1a73e8;
}

.toggle-btn {
  width: 36px;
  background: #f1f3f4;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toggle-btn:hover {
  background: #e8eaed;
}

.actions {
  display: flex;
  gap: 8px;
}

.save-btn {
  flex: 1;
  padding: 8px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.save-btn:not(:disabled):hover {
  background: #1557b0;
}

.clear-btn {
  padding: 8px 12px;
  background: transparent;
  color: #d93025;
  border: 1px solid #d93025;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
.clear-btn:hover {
  background: #fce8e6;
}

.feedback {
  font-size: 0.8rem;
  margin: 0;
  padding: 6px 10px;
  border-radius: 4px;
}
.feedback.ok {
  background: #e6f4ea;
  color: #1e8e3e;
}
.feedback.err {
  background: #fce8e6;
  color: #d93025;
}
</style>
