import type { GoogleGenAI } from '@google/genai'
import type { Review, ReviewSummary } from '../shared/types'

export async function callGemini(reviews: Review[], ai: GoogleGenAI): Promise<ReviewSummary> {
  const reviewText = reviews
    .map(r => `[${r.rating}★] ${r.text}`)
    .join('\n')

  const res = await ai.models.generateContent({
    model: 'gemma-4-31b-it',
    contents:
`Analyze these Shopee product reviews and return a JSON object with this exact shape:
{"groups":[{"feature":"string","pros":["..."],"cons":["..."]}],"prose":"string","reviewCount":number}

Reviews:
${reviewText}

Return ONLY the JSON, no other text.`,
  })

  const text = res.text
  const json = text?.replace(/^```json\s*|```\s*$/g, '').trim() ?? ''
  return JSON.parse(json) as ReviewSummary
}
