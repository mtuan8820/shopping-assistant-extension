import type { Review } from "./types";

export const slangMap: Record<string, string> = {
    shop: "cửa hàng",
    ib: "nhắn tin",
    rep: "trả lời",
    seen: "đã xem",
}

export const abbreviationMap: Record<string, string> = {
    ko: "không",
    dc: "được",
    đc: "được",

}

export function cleanString(str: string): string {
    // remove HTML tags
    let removeTagStr = str.replace(/<\/?[a-zA-Z]*[^>]*>/g, "");

    let tokens: string[] = removeTagStr.split(" ");

    // handle slang and abbreviation
    tokens = tokens.map(token => abbreviationMap[token] ?? slangMap[token] ?? token);
    
    return tokens.join(" ");
}

export function cleanReview(review: Review): Review{
    if (review.text.length > 0){
        review.text = cleanString(review.text);
    }

    review.features?.forEach(feature => cleanString(feature.text));
    return review;
} 