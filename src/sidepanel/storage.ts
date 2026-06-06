const GEMINI_KEY = 'geminiApiKey'

export async function getGeminiApiKey(): Promise<string | null> {
  const result = await chrome.storage.local.get(GEMINI_KEY)
  return (result[GEMINI_KEY] as string) ?? null
}

export async function saveGeminiApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [GEMINI_KEY]: key })
}

export async function clearGeminiApiKey(): Promise<void> {
  await chrome.storage.local.remove(GEMINI_KEY)
}
