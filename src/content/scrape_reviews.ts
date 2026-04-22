import type { Review } from '../shared/types'

const PAGE_LOAD_TIMEOUT = 5000

const REVIEW_ITEM_SELECTORS = [
  '.shopee-product-comment-list > div',
]

// relative to each review item
const REVIEW_TEXT_SELECTORS = [
  'div:nth-child(2) > div:nth-child(2)',
]

const NEXT_PAGE_BTN_SELETORS = [
  '.shopee-icon-button--right'
]

function scrollToReviews(): void {
  document.querySelector('.product-rating-overview__filters')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function getStarFilterButtons(): HTMLElement[] {
  const all = document.querySelectorAll<HTMLElement>('.product-rating-overview__filter')
  // index 0 = All, index 1-5 = 5★ down to 1★
  // after reversed, returned array's index 0 = 1★, index 1 = 2★ 
  return Array.from(all).slice(1, 6).reverse();
}

function getNextPageButton(): HTMLElement | null {
  for (const selector of NEXT_PAGE_BTN_SELETORS) {
    const btn = document.querySelector<HTMLElement>(selector)
    if (btn) return btn;
  }
  return null;
}

function getFirstReviewText(): string | null {
  for (const itemSel of REVIEW_ITEM_SELECTORS) {
    const item = document.querySelector(itemSel)
    if (!item) continue
    for (const textSel of REVIEW_TEXT_SELECTORS) {
      const text = item.querySelector(textSel)?.textContent?.trim()
      if (text) return text
    }
  }
  return null
}

function waitForReviewsToChange(prevText: string | null, timeout = PAGE_LOAD_TIMEOUT): Promise<boolean> {
  return new Promise((resolve) => {
    const changed = () => {
      const t = getFirstReviewText()
      return t !== null && t !== prevText
    }
    if (changed()) { resolve(true); return }

    const obs = new MutationObserver(() => { if (changed()) { obs.disconnect(); resolve(true) } })
    obs.observe(document.body, { childList: true, subtree: true })
    setTimeout(() => { obs.disconnect(); resolve(false) }, timeout)
  })
}

function scrapeCurrentPage(rating: number): Review[] {
  const reviews: Review[] = []

  for (const s of REVIEW_ITEM_SELECTORS) {
    const items = document.querySelectorAll(s)
    if (items.length === 0) continue

    items.forEach((item) => {
      let text = ''
      for (const ts of REVIEW_TEXT_SELECTORS) {
        const t = item.querySelector(ts)?.textContent?.trim()
        if (t) { text = t; break }
      }
      if (!text) return

      const date = item.querySelector('[class*="time"], [class*="date"]')?.textContent?.trim()
      reviews.push({ text, rating, ...(date ? { date } : {}) })
    })
    break
  }

  return reviews
}

export async function scrapeReviews(): Promise<Review[]> {
  scrollToReviews()

  const starFilters = getStarFilterButtons()
  if (starFilters.length === 0) return []
  console.log(starFilters)

  const allReviews: Review[] = []

  for (const [index, filterBtn] of starFilters.entries()) {
    console.debug({currentFilter: filterBtn.textContent, index: index})
    const rating = index+1;
    
    let prevText = getFirstReviewText()
    
    filterBtn.click()

    let changed = await waitForReviewsToChange(prevText)
    if (!changed) continue

    allReviews.push(...scrapeCurrentPage(rating))
    

    let currentPageText = getFirstReviewText()
    const nextReviewPageBtn = getNextPageButton();
    console.log(nextReviewPageBtn);

    if (nextReviewPageBtn != null) {
      for (const _ of [...Array(9).keys()]) {
        nextReviewPageBtn.click();
        changed = await waitForReviewsToChange(currentPageText)
        if (!changed) break;

        allReviews.push(...scrapeCurrentPage(rating))
        currentPageText = getFirstReviewText()
      }
    } else {
      console.debug("cannot get next-page-button", {currentFilter: filterBtn.textContent})
    }
  }

  return allReviews
}
