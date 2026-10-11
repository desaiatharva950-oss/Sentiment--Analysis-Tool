
from sentiment import analyze_sentiment


test_sentences = [
    "I absolutely love this product!",
    "This is the worst experience ever.",
    "The package arrived today.",
]

for sentence in test_sentences:
    result = analyze_sentiment(sentence)

    print(f"\nText: {result['text']}")
    print(f"Sentiment: {result['sentiment']}")
    print(f"Scores: {result['scores']}")
