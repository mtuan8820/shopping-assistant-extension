import type { Feature, Review } from '../shared/types'

const PAGE_LOAD_TIMEOUT = 5000

const REVIEW_ITEM_SELECTORS = [
  '.shopee-product-comment-list > div',
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

function getReviewListFingerprint(): string {
  const items = document.querySelectorAll<Element>('.shopee-product-comment-list > div')
  return `${items.length}:${items[0]?.textContent?.trim() ?? ''}`
}

function getReview(commentItem: Element, rating: number): Review {
  // children: [0]=meta, [...middle?]=content+video, [-1]=like-btn
  // middle[0]=content wrapper(features+text), middle[1?]=video/image
  const allChildren = Array.from(commentItem.children)
  const metaEl = allChildren[0]
  const middle = allChildren.slice(1, -1)
  const contentEl = middle[0]

  const date = metaEl
    ?.querySelector('[class*="time"], [class*="date"]')?.textContent?.trim()

  let features: Feature[] | null = null
  let text = ''

  if (!contentEl) return { features, rating, text, date }

  const contentChildren = Array.from(contentEl.children)

  const parseFeatures = (node: Element): Feature[] => {
    const result: Feature[] = []
    console.log({feature: result})
    for (const child of node.children ?? []) {
      const raw = child.textContent?.trim() ?? ''
      if (!raw) continue
      const [featureName, ...rest] = raw.split(/:(.*)/s)
      result.push({ name: featureName.trim(), text: rest[0]?.trim() ?? '' })
    }
    return result
  }

  const looksLikeFeatures = (node: Element) =>
    node.children.length > 0 &&
    Array.from(node.children).some(c => /\p{L}.*:\s/u.test(c.textContent ?? ''))

  if (contentChildren.length >= 2) {
    features = parseFeatures(contentChildren[0])
    text = contentChildren[1].textContent?.trim() ?? ''
  } else if (contentChildren.length === 1) {
    if (looksLikeFeatures(contentChildren[0])) {
      features = parseFeatures(contentChildren[0])
    } else {
      text = contentChildren[0].textContent?.trim() ?? ''
    }
  }

  return {text, rating, date, features}
}

function waitForReviewsToChange(prevFingerprint: string, timeout = PAGE_LOAD_TIMEOUT): Promise<boolean> {
  return new Promise((resolve) => {
    const reviewsReady = () => {
      const fp = getReviewListFingerprint()
      const count = document.querySelectorAll<Element>('.shopee-product-comment-list > div').length
      return fp !== prevFingerprint && count > 0
    }
    if (reviewsReady()) { resolve(true); return }

    const obs = new MutationObserver(() => { if (reviewsReady()) { obs.disconnect(); resolve(true) } })
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
      const commentSection = item.children[1]
      if (!commentSection) return
      const review = getReview(commentSection, rating)
      reviews.push(review)
    })
    break
  }

  return reviews
}

function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function scrapeReviews(): Promise<Review[]> {
  scrollToReviews()

  const filterCount = getStarFilterButtons().length
  if (filterCount === 0) return []

  const allReviews: Review[] = []

  for (let index = 0; index < filterCount; index++) {
    // Re-query each iteration so we never click a stale/detached element
    const filterBtn = getStarFilterButtons()[index]
    if (!filterBtn) break
    const rating = index + 1
    
    let prevText = getReviewListFingerprint()
    
    filterBtn.click()

    let changed = await waitForReviewsToChange(prevText)
    if (!changed) continue

    allReviews.push(...scrapeCurrentPage(rating))
    

    let currentPageText = getReviewListFingerprint()
    const nextReviewPageBtn = getNextPageButton();

    if (nextReviewPageBtn != null) {
      for (const _ of [...Array(5).keys()]) {
        nextReviewPageBtn.click();
        changed = await waitForReviewsToChange(currentPageText)
        if (!changed) break;

        allReviews.push(...scrapeCurrentPage(rating))
        currentPageText = getReviewListFingerprint()
      }
    } else {
      console.log("cannot get next-page-button", {currentFilter: filterBtn.textContent})
    }
  }

  downloadJSON(allReviews, `reviews_${Date.now()}.json`)
  return allReviews
}
