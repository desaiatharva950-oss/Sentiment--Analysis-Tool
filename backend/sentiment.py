
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


# Initialize the VADER analyzer once.
analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(text: str) -> dict:
    """
    Analyze text and return its sentiment label and scores.
    """

    if not isinstance(text, str) or not text.strip():
        raise ValueError("Input text must not be empty.")

    scores = analyzer.polarity_scores(text)
    compound_score = scores["compound"]

    if compound_score >= 0.05:
        sentiment = "Positive"
    elif compound_score <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    return {
        "text": text,
        "sentiment": sentiment,
        "scores": scores,
    }
