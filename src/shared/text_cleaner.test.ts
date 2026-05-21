import { cleanString } from "./text_cleaner";

test.for([
    ["<>i'm trying to inject html to your code base</>", "i'm trying to inject html to your code base"],
    ["đã ib nhưng shop seen ko rep", "đã nhắn tin nhưng cửa hàng đã xem không trả lời"],
    ["", ""],
    ["this-should-not-be-in-the-dict sản phẩm tốt", "this-should-not-be-in-the-dict sản phẩm tốt"]
])('cleanString(%s)-> %s',([beforeClean, expected])=> {
    expect(cleanString(beforeClean)).toBe(expected);
})