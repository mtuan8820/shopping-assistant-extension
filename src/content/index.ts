import type { Message, ProductInfoResponse, ReviewsResponse } from '../shared/types'
import { waitForPrice, scrapeProductInfo } from './scrape_product_info'
import { scrapeReviews } from './scrape_reviews'

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: (r: ProductInfoResponse | ReviewsResponse) => void) => {
    if (message.type === 'GET_PRODUCT_INFO') {
      waitForPrice().then(() => {
        const productInfo = scrapeProductInfo()
        sendResponse({ product: productInfo })
        console.log("[PRODUCT INFO]", productInfo)
      }).catch(e => {
        console.error('[GET_PRODUCT_INFO]', e)
        sendResponse({ product: null })
      })
    }

    if (message.type === 'GET_REVIEWS') {
      scrapeReviews().then(reviews => {
        sendResponse({ reviews })
        console.log(`[REVIEWS] ${reviews.length} scraped`)
      }).catch(e => {
        console.error('[GET_REVIEWS]', e)
        sendResponse({ reviews: [] })
      })
    }

    return true
  }
)