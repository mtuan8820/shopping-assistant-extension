export function waitForPrice(timeout = 10000): Promise<void> {
  return new Promise((resolve) => {
    const priceSelectors = [".IZPeQz",".B67UQ0"]
    const check = () => priceSelectors.some(s => document.querySelector(s))
    if (check()) { resolve(); return }

    const observer = new MutationObserver(() => {
      if (check()) { observer.disconnect(); resolve() }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    setTimeout(() => { observer.disconnect(); resolve() }, timeout)
  })
}


export function scrapeProductInfo() {
  const title = document.querySelector('h1')?.textContent?.trim() ?? document.title
  const priceSelectors = [
    ".IZPeQz", 
    ".B67UQ0",
  ]

  let price: string | null = null
  for (const selector of priceSelectors) {
    const text = document.querySelector(selector)?.innerHTML?.trim()
    if (text) { price = text; break }
  }

  let avgStar: number = 5;

  let reviewCount: number = 0;

  return { title, price, url: location.href, avgStar, reviewCount }
}
