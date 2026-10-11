
import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parent / "sentiment.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                sentiment TEXT NOT NULL,
                positive_score REAL NOT NULL,
                negative_score REAL NOT NULL,
                neutral_score REAL NOT NULL,
                compound_score REAL NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


def save_analysis(text, result):
    scores = result["scores"]

    with get_connection() as connection:
        cursor = connection.execute("""
            INSERT INTO analyses (
                text, sentiment, positive_score,
                negative_score, neutral_score, compound_score
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            text,
            result["sentiment"],
            scores["pos"],
            scores["neg"],
            scores["neu"],
            scores["compound"],
        ))

        return cursor.lastrowid


def get_analysis_history(limit=50):
    limit = max(1, min(int(limit), 100))

    with get_connection() as connection:
        rows = connection.execute("""
            SELECT *
            FROM analyses
            ORDER BY id DESC
            LIMIT ?
        """, (limit,)).fetchall()

        return [dict(row) for row in rows]
