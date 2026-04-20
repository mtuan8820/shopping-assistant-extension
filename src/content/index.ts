import type { Message, ProductInfoResponse } from '../shared/types'
import {waitForPrice, scrapeProductInfo} from './scrape_product_info'

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: (r: ProductInfoResponse) => void) => {
    if (message.type === 'GET_PRODUCT_INFO') {
      waitForPrice().then(() => {
        const productInfo = scrapeProductInfo()
        sendResponse({ product: productInfo })
        console.log("[PRODUCT INFO]", productInfo)
      })
    }
    return true
  }
)

// chrome.runtime.onMessage.addListener(
//   (message: Message, _sender, sendResponse:() => void) => {
//     if (message.type === 'GET_REVIEWS')
//   }
// )