
import { useEffect, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const API_URL = "http://127.0.0.1:5000/api";

const COLORS = {
  Positive: "#16a34a",
  Neutral: "#64748b",
  Negative: "#dc2626",
};

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refreshDashboard() {
    try {
      const [statsResponse, historyResponse] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/history`),
      ]);

      if (!statsResponse.ok || !historyResponse.ok) {
        throw new Error("Could not load dashboard data.");
      }

      const statsData = await statsResponse.json();
      const historyData = await historyResponse.json();

      setStats(statsData);
      setHistory(historyData.history);
    } catch {
      setError("Cannot connect to the backend. Check that Flask is running.");
    }
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  async function handleAnalyze(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
      setText("");
      await refreshDashboard();
    } catch (err) {
      setError(err.message || "Unable to analyze text.");
    } finally {
      setLoading(false);
    }
  }

  const distributionData = [
    { name: "Positive", value: stats.positive },
    { name: "Neutral", value: stats.neutral },
    { name: "Negative", value: stats.negative },
  ];

  const scoreData = result
    ? [
        { name: "Positive", score: result.scores.pos * 100 },
        { name: "Neutral", score: result.scores.neu * 100 },
        { name: "Negative", score: result.scores.neg * 100 },
      ]
    : [];

  const sentimentClass = result?.sentiment?.toLowerCase();

  return (
    <main className="container">
      <header className="header">
        <p className="eyebrow">AI-POWERED TEXT ANALYSIS</p>
        <h1>Sentiment Dashboard</h1>
        <p>Understand the emotions behind your text.</p>
      </header>

      <section className="stats-grid" aria-label="Analysis summary">
        <article className="stat-card">
          <span>Total analyses</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="stat-card positive-card">
          <span>Positive</span>
          <strong>{stats.positive}</strong>
        </article>
        <article className="stat-card neutral-card">
          <span>Neutral</span>
          <strong>{stats.neutral}</strong>
        </article>
        <article className="stat-card negative-card">
          <span>Negative</span>
          <strong>{stats.negative}</strong>
        </article>
      </section>

      <section className="charts-grid">
        <article className="panel chart-panel">
          <h2>Sentiment distribution</h2>
          <p className="muted">Breakdown of all saved analyses</p>

          {stats.total === 0 ? (
            <p className="empty-chart">Analyze some text to see your chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {distributionData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}

          <div className="legend">
            {distributionData.map((item) => (
              <span key={item.name}>
                <i style={{ backgroundColor: COLORS[item.name] }} />
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        </article>

        <article className="panel chart-panel">
          <h2>Latest analysis scores</h2>
          <p className="muted">
            Score breakdown for your most recent prediction
          </p>

          {!result ? (
            <p className="empty-chart">
              Analyze text to view its score breakdown.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scoreData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]}>
                  {scoreData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {result && (
            <p className="chart-note">
              Label: <strong className={sentimentClass}>{result.sentiment}</strong>.
              Scores are VADER sentiment proportions, not confidence probabilities.
            </p>
          )}
        </article>
      </section>

      <section className="panel analyzer">
        <h2>Analyze new text</h2>
        <form onSubmit={handleAnalyze}>
          <label htmlFor="text">Enter your text</label>
          <textarea
            id="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Example: I absolutely love this product!"
            rows={5}
            maxLength={10000}
          />
          <div className="form-footer">
            <span>{text.length}/10000 characters</span>
            <button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze sentiment"}
            </button>
          </div>
        </form>

        {error && <p className="error" role="alert">{error}</p>}

        {result && (
          <section className="result" aria-live="polite">
            <p className="eyebrow">ANALYSIS RESULT</p>
            <h2 className={sentimentClass}>{result.sentiment}</h2>
            <p className="compound">
              Compound score: {result.scores.compound.toFixed(3)}
            </p>
          </section>
        )}
      </section>

      <section className="panel history">
        <div className="section-heading">
          <div>
            <h2>Recent analyses</h2>
            <p className="muted">Your latest saved predictions</p>
          </div>
          <button className="secondary-button" onClick={refreshDashboard}>
            Refresh
          </button>
        </div>

        {history.length === 0 ? (
          <p className="muted">Your analysis history will appear here.</p>
        ) : (
          history.map((item) => (
            <article className="history-item" key={item.id}>
              <div className="history-copy">
                <p>{item.text}</p>
                <small>{item.created_at}</small>
              </div>
              <span className={`tag ${item.sentiment.toLowerCase()}`}>
                {item.sentiment}
              </span>
            </article>
          ))
        )}
      </section>

      <footer>Built with React, Flask, VADER and SQLite</footer>
    </main>
  );
}

export default App;
