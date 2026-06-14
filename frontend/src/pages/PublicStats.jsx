import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { FiActivity, FiClock, FiExternalLink, FiLink, FiMonitor, FiZap } from "react-icons/fi";
import { BrowserBarChart, ClickTrendChart, DevicePieChart } from "../components/Charts";
import StatsCard from "../components/StatsCard";
import api from "../api";

export default function PublicStats() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/analytics/public/${shortCode}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Stats not found for this link."))
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  if (error || !data) {
    return (
      <div className="public-stats-page">
        <div className="public-stats-header">
          <FiActivity size={52} style={{ marginBottom: "1rem", color: "var(--purple-1)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Stats Not Found</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>{error}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>Go to LinkSnap</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-stats-page">
      <div className="public-brand-bar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-icon"><FiZap /></div>
          <span className="navbar-brand-name">LinkSnap</span>
        </Link>
        <span className="text-xs text-muted">Public Stats</span>
      </div>

      <div className="public-stats-header">
        <FiActivity size={44} style={{ marginBottom: "0.75rem", color: "var(--purple-1)" }} />
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>Link Statistics</h1>
        {data.title && <div className="public-link-title">{data.title}</div>}
        <a href={`http://localhost:5000/${data.shortCode}`} target="_blank" rel="noopener noreferrer" className="public-short-link">
          <FiLink size={16} /> {data.shortCode} <FiExternalLink size={13} />
        </a>
        <div className="public-original-url">Destination: {data.originalUrl}</div>
        <div className="text-xs text-muted" style={{ marginTop: "0.35rem" }}>
          Created {data.createdAt ? format(new Date(data.createdAt), "MMMM d, yyyy") : ""}
        </div>
      </div>

      <div className="public-stats-content">
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", marginBottom: "1.5rem" }}>
          <StatsCard icon={<FiActivity />} value={data.totalClicks} label="Total Clicks" gradient="linear-gradient(135deg,#667eea,#764ba2)" iconBg="rgba(102,126,234,0.15)" />
          <StatsCard icon={<FiClock />} value={data.lastVisited ? formatDistanceToNow(new Date(data.lastVisited), { addSuffix: true }) : "Never"} label="Last Visited" gradient="linear-gradient(135deg,#4facfe,#00f2fe)" iconBg="rgba(79,172,254,0.15)" />
        </div>

        <div className="charts-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="chart-card">
            <div className="chart-title"><FiActivity /> Daily Clicks (Last 30 Days)</div>
            <ClickTrendChart data={data.dailyTrend} />
          </div>
          <div className="chart-card">
            <div className="chart-title"><FiMonitor /> Devices</div>
            <DevicePieChart data={data.deviceBreakdown} />
          </div>
        </div>

        <div className="chart-card" style={{ marginBottom: "2rem" }}>
          <div className="chart-title"><FiExternalLink /> Browsers</div>
          <BrowserBarChart data={data.browserBreakdown} />
        </div>

        <div style={{ textAlign: "center", paddingBottom: "2rem" }}>
          <Link to="/" className="btn btn-primary">Create your own free short links</Link>
        </div>
      </div>
    </div>
  );
}
