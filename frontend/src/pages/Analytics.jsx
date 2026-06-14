import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiActivity, FiArrowLeft, FiCalendar, FiCheck, FiClock,
  FiExternalLink, FiMonitor, FiShare2, FiTag, FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { BrowserBarChart, ClickTrendChart, DevicePieChart } from "../components/Charts";
import api from "../api";

const BASE = "http://localhost:5000";

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/analytics/${id}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyPublicLink = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(`${window.location.origin}/stats/${data.url.shortCode}`);
    setCopied(true);
    toast.success("Public stats link copied.");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading-screen" style={{ background: "transparent" }}><div className="spinner" /></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page">
        <Navbar />
        <div className="page-content">
          <div className="empty-state">
            <FiActivity className="empty-state-icon" />
            <div className="empty-state-title">Analytics not found</div>
            <button className="btn btn-primary mt-2" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const { url, totalClicks, lastVisited, recentVisits, dailyTrend, deviceBreakdown, browserBreakdown } = data;
  const shortUrl = `${BASE}/${url.shortCode}`;

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")} style={{ marginBottom: "1rem", paddingLeft: 0 }}>
          <FiArrowLeft size={15} /> Back to Dashboard
        </button>

        <div className="analytics-header">
          <div className="analytics-url-info">
            <div className="analytics-url-short">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="inline-link">
                <FiZap size={17} /> {shortUrl} <FiExternalLink size={14} />
              </a>
            </div>
            <div className="analytics-url-original">{url.originalUrl}</div>
            {url.title && <div className="analytics-title"><FiTag size={13} /> {url.title}</div>}
          </div>

          <div className="button-wrap">
            <button className="btn btn-secondary btn-sm" onClick={handleCopyPublicLink}>
              {copied ? <FiCheck size={14} /> : <FiShare2 size={14} />}
              Share Stats
            </button>
            <Link to={`/stats/${url.shortCode}`} target="_blank" className="btn btn-ghost btn-sm">
              <FiExternalLink size={14} /> Public Page
            </Link>
          </div>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
          <StatsCard icon={<FiActivity />} value={totalClicks} label="Total Clicks" gradient="linear-gradient(135deg,#667eea,#764ba2)" iconBg="rgba(102,126,234,0.15)" />
          <StatsCard icon={<FiClock />} value={lastVisited ? formatDistanceToNow(new Date(lastVisited), { addSuffix: true }) : "Never"} label="Last Visited" gradient="linear-gradient(135deg,#4facfe,#00f2fe)" iconBg="rgba(79,172,254,0.15)" />
          <StatsCard icon={<FiCalendar />} value={format(new Date(url.createdAt), "MMM d, yyyy")} label="Created" gradient="linear-gradient(135deg,#43e97b,#38f9d7)" iconBg="rgba(67,233,123,0.15)" />
          <StatsCard icon={<FiClock />} value={url.expiresAt ? format(new Date(url.expiresAt), "MMM d, yyyy") : "Never"} label="Expires" gradient="linear-gradient(135deg,#f093fb,#f5576c)" iconBg="rgba(240,147,251,0.15)" />
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title"><FiActivity /> Daily Clicks (Last 30 Days)</div>
            <ClickTrendChart data={dailyTrend} />
          </div>
          <div className="chart-card">
            <div className="chart-title"><FiMonitor /> Device Breakdown</div>
            <DevicePieChart data={deviceBreakdown} />
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title"><FiExternalLink /> Browser Breakdown</div>
            <BrowserBarChart data={browserBreakdown} />
          </div>
          <div className="chart-card visits-timeline">
            <div className="chart-title"><FiClock /> Recent Visits</div>
            {recentVisits.length === 0 ? (
              <div className="empty-chart-text">No visits yet. Share your link to see data here.</div>
            ) : (
              recentVisits.slice(0, 10).map((v, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot" />
                  <div className="timeline-device">{v.device}</div>
                  <div className="timeline-browser">{v.browser} - {v.os}</div>
                  <div className="timeline-time">{formatDistanceToNow(new Date(v.visitedAt), { addSuffix: true })}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
