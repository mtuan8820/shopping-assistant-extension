# 

so this is a shopping assistant extension

this is an MVP

What problem does it solve:
- when shopping online, many of us spend time to read the feedbacks about the products, but there might be too many feedback and we dont have time to read them all. Beside, there are also contradict feedbacks, unrelated feedbacks, duplicates, seeding, etc. As a "wise" consumer, it takes so much times to go back and forth between pages and compare the same product but from differnt shop. So i come up with an idea to build an extension that can summarize different feedbacks into pros and cons, then users can copy that info to paste in google excel for comparision

REMEMBER!!!

 this tool just help customer quickly "study" the comment section of the product they are considering, not the one that make final decision.

current target:
- the end user: online buyers in VN (because they use Shopee alot)
- browser: goole chrome, edge
- ecommerce platform: shopee

Scope: 


Out of scope:
review that dont have comment

main features:
- scrape all the comments


The input of the tool obviously the DOM of the current-opened page that contains the product which we want to get insight about from previous buyer.

So the first feature must be "scrape all the comments". So maybe i should research about strategies to do online shopping

some notes:
- Similar reviews does not means it is bad, it is a duplicate that need to be removed, it gives us a meaningful info: the consistent.


Feature Breakdown: Scrape All Comments
1. Analyze Target Data Structure

On a Shopee product page, comments are organized in multiple ways:

By presence of content
Comments with content
Comments without content
By rating
1-star → 5-star (5 separate groups)
2. Comment DOM Structure

Each comment block contains 4 main child elements:

- Header Section (include Username, Rating, Date,Reviewer metadata)

- Content Section (Main Comment)


  Visible comment content can be split into:

    - Features (structured key-value format)
      Example:

        {
          "Chất lượng sản phẩm": "chất lượng tốt"
        }
    - Main text (free-form user comment)
- Media Section (Optional)
  Images and/or videos
- Interaction Section
  Like button

1. Definition: “Has Comment”

A comment is considered valid (has content) if:

It contains features, or
It contains main text, or
It contains both
4. Scraping Strategy
Step 1: Iterate by Rating Filter
Loop through all rating categories:
1-star → 5-star
Step 2: For Each Rating
Click the corresponding filter
Scrape all comments on the current page
Step 3: Pagination
Continue scraping by navigating through pages:
Click Next page
Repeat until no more pages

