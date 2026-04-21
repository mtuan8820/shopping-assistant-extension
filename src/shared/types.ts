export interface ProductInfo {
  title: string
  price: string | null
  url: string
  avgStar: number
  reviewCount: number
}

  export type Message =                                                                                                            
    | { type: 'GET_PRODUCT_INFO' }
    | { type: 'GET_REVIEWS' }                                                                                                      
    | { type: 'REVIEWS_RESULT'; reviews: Review[] }

export interface ProductInfoResponse {
  product: ProductInfo | null
  error?: string
}

export interface Review {
  text: string
  rating: number
  date?: string
}

export interface FeatureGroup{
  feature: string //e.g. "Delivery", "Price"
  pros: string[]
  cons: string[]
}

export interface ReviewSummary{
  groups: FeatureGroup[]
  prose: string
  reviewCount: number
}

export interface ReviewsResponse {
  reviews: Review[]
  error?: string
}