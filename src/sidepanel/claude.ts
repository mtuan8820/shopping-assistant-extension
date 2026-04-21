import type { Review, ReviewSummary } from "../shared/types";

export async function callClaude(reviews: Review[], apiKey: string): Promise<ReviewSummary> {
    const reviewText = reviews.map(review => `[${review.rating}★] ${review.text}`).join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: `Analyze these Shopee product reviews and return a JSON object with this exact shape:
  {"groups":[{"feature":"string","pros":["..."],"cons":["..."]}],"prose":"string","reviewCount":number}

  Reviews:
  ${reviewText}

  Return ONLY the JSON, no other text.`,
            }],
        }),
    })
    if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
    const data = await response.json()
    return JSON.parse(data.content[0].text) as ReviewSummary
}