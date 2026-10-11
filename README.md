# Sentiment Analysis Dashboard

A full-stack web application that analyzes text sentiment and visualizes the results through an interactive dashboard.

## Features

- Sentiment classification: Positive, Negative, and Neutral
- VADER sentiment scoring
- Interactive dashboard with sentiment distribution charts
- SQLite database for persistent analysis history
- REST API built with Flask
- React frontend built with Vite
- Automated backend tests using pytest

## Tech Stack

- **Frontend:** React, Vite, Recharts
- **Backend:** Python, Flask, Flask-CORS
- **Sentiment Analysis:** VADER
- **Database:** SQLite
- **Testing:** pytest
- **Version Control:** Git

## Project Structure

```text
SAT/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── sentiment.py
│   ├── test_app.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Setup and Run

### 1. Backend

Open a terminal in the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`.

### 2. Frontend

Open a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite in your browser.

### 3. Run Tests

Open a terminal in the backend directory with the virtual environment activated:

```powershell
python -m pytest -v
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| POST | `/api/analyze` | Analyze text sentiment |
| GET | `/api/history` | Retrieve saved analyses |
| GET | `/api/stats` | Retrieve sentiment counts |

Example request for `/api/analyze`:

```json
{
  "text": "I absolutely love this product!"
}
```

## How Sentiment Is Classified

VADER returns positive, neutral, negative, and compound scores. The compound score determines the sentiment label using the configured thresholds. The individual sentiment scores are proportions, not model confidence probabilities.

## Future Improvements

- Deployment to a hosting platform
- More comprehensive automated tests
- Improved error handling and configuration

## License

Choose a license before distributing or reusing this project publicly.
