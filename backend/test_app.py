
import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as test_client:
        yield test_client


def test_health_endpoint(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


@pytest.mark.parametrize(
    ("text", "expected_sentiment"),
    [
        ("I absolutely love this product!", "Positive"),
        ("This is the worst experience ever.", "Negative"),
        ("The package arrived today.", "Neutral"),
    ],
)
def test_analyze_sentiment(client, text, expected_sentiment):
    response = client.post(
        "/api/analyze",
        json={"text": text},
    )

    assert response.status_code == 200

    data = response.get_json()
    assert data["sentiment"] == expected_sentiment
    assert "compound" in data["scores"]


def test_analyze_rejects_empty_text(client):
    response = client.post(
        "/api/analyze",
        json={"text": "   "},
    )

    assert response.status_code == 400
    assert "error" in response.get_json()


def test_analyze_rejects_missing_text(client):
    response = client.post("/api/analyze", json={})

    assert response.status_code == 400


def test_stats_endpoint(client):
    response = client.get("/api/stats")

    assert response.status_code == 200

    data = response.get_json()
    assert "total" in data
    assert "positive" in data
    assert "negative" in data
    assert "neutral" in data
