
from flask import Flask, jsonify, request
from flask_cors import CORS

from database import (
    initialize_database,
    save_analysis,
    get_analysis_history,
)
from sentiment import analyze_sentiment

app = Flask(__name__)
CORS(app)

initialize_database()


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON."}), 400

    text = data.get("text")

    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Please provide non-empty text."}), 400

    try:
        result = analyze_sentiment(text.strip())
        analysis_id = save_analysis(text.strip(), result)

        return jsonify({
            "id": analysis_id,
            **result,
        }), 200

    except ValueError as error:
        return jsonify({"error": str(error)}), 400


@app.get("/api/history")
def history():
    try:
        limit = request.args.get("limit", default=50, type=int)

        if limit is None:
            return jsonify({"error": "Limit must be an integer."}), 400

        return jsonify({"history": get_analysis_history(limit)})

    except (TypeError, ValueError):
        return jsonify({"error": "Invalid history limit."}), 400


@app.get("/api/stats")
def stats():
    from database import get_connection

    with get_connection() as connection:
        total = connection.execute(
            "SELECT COUNT(*) FROM analyses"
        ).fetchone()[0]

        rows = connection.execute("""
            SELECT sentiment, COUNT(*) AS count
            FROM analyses
            GROUP BY sentiment
        """).fetchall()

    counts = {"Positive": 0, "Negative": 0, "Neutral": 0}
    for row in rows:
        counts[row["sentiment"]] = row["count"]

    return jsonify({
        "total": total,
        "positive": counts["Positive"],
        "negative": counts["Negative"],
        "neutral": counts["Neutral"],
    })



if __name__ == "__main__":
    app.run(debug=True, port=5000)
