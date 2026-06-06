## 1. Data overview
I collected comments from four products across four categories: clothes, books, furniture, and phones.  
The data was reviewed both manually and programmatically using Python (pandas + scikit-learn) to extract insights.

- **Average comment length** (text only): 127.98 characters  
- **Percentage of comments containing slang**: 57.94%

### Top 20 most frequent words
```
hàng: 417
shop: 397
mua: 278
giao: 274
thì: 238
mình: 232
có: 228
nhưng: 217
bị: 203
gói: 201
sách: 191
nên: 181
rất: 179
mà: 177
chất: 166
không: 162
đóng: 158
là: 156
ko: 147
k: 147
```

## 2. Common Issues

### 2.1 Nonsensical comments
Some comments contain meaningless or random text, providing no useful information.

**Example:**
```  {
    "text": "hvgfcgt",
    "rating": 1,
    "features": [
      {
        "name": "Chất liệu",
        "text": "c bhfc"
      },
    ]
  },
```

### 2.2. Slang usage
A large portion of comments (57.94%) includes informal abbreviations commonly used in Vietnamese, such as:

- `k`, `ko` → "không"  
- `dc`, `đc` → "được"  
- etc.
### 2.3 Typographical Errors

User's comments contain many typographical errors. These errors are likely due to:
- fast or careless typing
- use of mobile devices
- lack of standard spelling

At this stage, no automated approach has been implemented to systematically detect or correct typos. The observation is based on manual inspection of the dataset.

Typos may affect downstream processing, particularly:
- dictionary-based validation
- keyword extraction
- sentiment analysis

### 2.4 Stupid users
 I will add a section because I felt so annoyed. Too many stupid people. Non-relate comments; they even did something like: "I love this shop but I rate 1 star because I know people will look up for 1 star comment section first"???

Due to its low frequency, this problem is not addressed in the current scope but is documented for completeness.

## 3. Data cleaning strategy
### 3.1 Remove non sense comments
Use a Vietnamese dictionary (~79k words) stored as a hash set, where lookup has O(1) average time complexity.

At first I think the solution is just that simple. But Vietnamese people use a lot of English word (e.g. shop, okay, good, etc) or domain-specific terms (e.g. ship, cod, etc). So this approach might remove neccessary words and leads to an misunderstanding.

There is 2 solutions that i come up with
- First one is combining English dictionary with Vietnamese dictionary
- Second one is using a hashmap to save common English words used by Vietnamese.

First approach obviously more accuracy but trade-off with the memory.


In practice:
- The average comment length is ~129 tokens
- Therefore, the operation is efficient and close to linear with a small constant factor

Trade-off:
- Additional memory is required to store the dictionary (~79k words), but this is acceptable (a few MB in memory)

-> I choose solution 2
The final decision is using a Vietnamese dictionary combine with self made hashmap to save common english word using by vietnamese people
### 3.2 Replace slang with the correct one
Use a self-built hashmap to detect and replace slang with the corresponding correct word. The hashmap is manually curated based on observed patterns in the dataset (e.g. `k` → `không`, `dc` → `được`).

### 3.3 Noisy entity removal (HTML tag, trim space)
Strip any residual HTML tags (e.g. `<br>`, `&amp;`) that may come from the scraped DOM, then trim leading/trailing whitespace and collapse multiple spaces into one.

### 3.4 Deliberate non-steps
- **No stop word removal** — stop words are left in because we pass text directly to Gemini, which handles contextual understanding natively. Removing them would degrade the natural language input.
- **Keep emoji** — emojis carry sentiment signal in Vietnamese ecommerce reviews (e.g. 😊, 👍) and are understood by Gemini.
- **No lemmatization** — Vietnamese is an uninflected language (no verb conjugation or noun declension), so lemmatization does not apply.

## 4. Evaluation

### 4.1 Strategy

A user rating form measures the **whole pipeline** (scraping → cleaning → LLM → UI), not the cleaning step specifically. If users rate the summary poorly, the root cause is ambiguous.

A more targeted approach: **compare LLM output quality on cleaned vs uncleaned input.**

Pick ~20–30 representative raw reviews, run them through the LLM twice (once raw, once cleaned), then score the outputs on:
- **Coherence** — does the summary make sense?
- **Accuracy** — does it reflect the actual review content?
- **Noise** — does it surface garbage tokens (`hvgfcgt`, `bhfc`) or correctly ignore them?

Scoring can be done manually or by prompting another LLM call (LLM-as-judge).

### 4.2 User feedback

Add a thumbs up/down on the summary in the UI. Use it as a long-term signal post-launch, not as the primary evaluation during development. Keep it minimal — high friction means almost no one fills it out.

### 4.3 Automatic metrics (zero effort)

Track these automatically during every pipeline run:
- **% of comments discarded** as nonsense — if this exceeds ~30–40%, the dictionary is likely too strict and valid comments are being lost.
- **Average token count before vs after cleaning** — a large drop signals over-filtering.

## 5. Psuedo code
```
ret = []
for line in reviews:
  line = normalize(line) // remove html
  tokens = line.split(" ")
  tokens = [handle_slang(token) for token in tokens]
  cleaned_tokens = [w for w in tokens if dictionary.contains(w) ]
  ret.append(cleaned_tokens.join(" "))
  

```