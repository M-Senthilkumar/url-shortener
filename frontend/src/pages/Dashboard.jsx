import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiActivity, FiBarChart2, FiCheck, FiClock, FiCopy, FiEdit2,
  FiExternalLink, FiFilter, FiGrid, FiLink, FiPlus, FiSearch,
  FiTrash2, FiUpload, FiX,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import QRModal from "../components/QRModal";
import api from "../api";

const BASE = "http://localhost:5000";

function isExpired(url) {
  return Boolean(url.expiresAt && new Date(url.expiresAt) < new Date());
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [urls, setUrls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiry, setExpiry] = useState("");
  const [title, setTitle] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [qrUrl, setQrUrl] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async () => {
    try {
      const [urlsRes, summaryRes] = await Promise.all([
        api.get("/url"),
        api.get("/url/stats/summary"),
      ]);
      setUrls(urlsRes.data);
      setSummary(summaryRes.data);
    } catch {
      toast.error("Failed to load your links.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return urls.filter((u) => {
      const query = search.toLowerCase();
      const matchesSearch =
        u.originalUrl.toLowerCase().includes(query) ||
        u.shortCode.toLowerCase().includes(query) ||
        (u.title || "").toLowerCase().includes(query);

      const expired = isExpired(u);
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !expired) ||
        (filter === "expired" && expired);

      return matchesSearch && matchesFilter;
    });
  }, [urls, search, filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!longUrl.trim()) {
      setFormError("Please enter a URL.");
      return;
    }

    setCreating(true);
    try {
      await api.post("/url/create", {
        originalUrl: longUrl,
        customAlias: alias || undefined,
        expiresAt: expiry || undefined,
        title: title || undefined,
      });
      toast.success("Short link created.");
      setLongUrl("");
      setAlias("");
      setExpiry("");
      setTitle("");
      setShowAdvanced(false);
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create link.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    try {
      await api.delete(`/url/${id}`);
      toast.success("Link deleted.");
      await loadData();
    } catch {
      toast.error("Failed to delete link.");
    }
  };

  const handleCopy = async (shortCode, id) => {
    await navigator.clipboard.writeText(`${BASE}/${shortCode}`);
    setCopiedId(id);
    toast.success("Short link copied.");
    setTimeout(() => setCopiedId(null), 1800);
  };

  const startEdit = (url) => {
    setEditingId(url._id);
    setEditValue(url.originalUrl);
    setEditTitle(url.title || "");
    setEditExpiry(url.expiresAt ? url.expiresAt.slice(0, 10) : "");
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) return;
    setEditSaving(true);
    try {
      await api.put(`/url/${id}`, {
        originalUrl: editValue,
        title: editTitle,
        expiresAt: editExpiry || null,
      });
      toast.success("Link updated.");
      setEditingId(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update link.");
    } finally {
      setEditSaving(false);
    }
  };

  const minExpiry = new Date();
  minExpiry.setDate(minExpiry.getDate() + 1);

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Premium link command center</p>
            <h1 className="page-title"><span className="grad-text">LinkSnap Dashboard</span></h1>
            <p className="page-subtitle">Create branded short links, watch every click, and ship campaigns faster.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/bulk")}>
            <FiUpload size={15} /> Bulk Upload
          </button>
        </div>

        {summary && (
          <div className="stats-grid">
            <StatsCard icon={<FiLink />} value={summary.totalLinks} label="Total Links" gradient="linear-gradient(135deg,#667eea,#764ba2)" iconBg="rgba(102,126,234,0.15)" />
            <StatsCard icon={<FiActivity />} value={summary.totalClicks} label="Total Clicks" gradient="linear-gradient(135deg,#4facfe,#00f2fe)" iconBg="rgba(79,172,254,0.15)" />
            <StatsCard icon={<FiCheck />} value={summary.activeLinks} label="Active Links" gradient="linear-gradient(135deg,#43e97b,#38f9d7)" iconBg="rgba(67,233,123,0.15)" />
            <StatsCard icon={<FiBarChart2 />} value={summary.topUrl ? summary.topUrl.clicks : 0} label="Top Link Clicks" gradient="linear-gradient(135deg,#f093fb,#f5576c)" iconBg="rgba(240,147,251,0.15)" />
          </div>
        )}

        <section className="url-form-card">
          <form onSubmit={handleCreate}>
            <div className="url-form-main">
              <div style={{ flex: 1 }}>
                <input
                  id="url-input"
                  type="url"
                  className={`form-input ${formError ? "error" : ""}`}
                  placeholder="Paste a long URL, including https://"
                  value={longUrl}
                  onChange={(e) => { setLongUrl(e.target.value); setFormError(""); }}
                />
                {formError && <div className="form-error mt-1"><FiX size={12} /> {formError}</div>}
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? "Hide Options" : "Options"}
              </button>
              <button id="shorten-btn" type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <div className="spinner spinner-sm" /> : <FiPlus size={16} />}
                {creating ? "Creating..." : "Shorten"}
              </button>
            </div>

            {showAdvanced && (
              <div className="url-form-advanced">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Custom Alias</label>
                  <input id="custom-alias" className="form-input" placeholder="launch-2026" value={alias} onChange={(e) => setAlias(e.target.value)} />
                  <span className="form-hint">{BASE}/{alias || "your-alias"}</span>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Expiry Date</label>
                  <input id="expiry-date" type="date" className="form-input" value={expiry} min={minExpiry.toISOString().split("T")[0]} onChange={(e) => setExpiry(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Title / Campaign</label>
                  <input id="url-title" className="form-input" placeholder="Spring launch" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
              </div>
            )}
          </form>
        </section>

        <section className="url-list-card">
          <div className="url-list-header">
            <span className="url-list-title">Your Links <span className="muted-count">({filtered.length})</span></span>
            <div className="url-list-tools">
              <div className="filter-tabs" aria-label="Filter links">
                {["all", "active", "expired"].map((item) => (
                  <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} type="button">
                    <FiFilter size={12} /> {item}
                  </button>
                ))}
              </div>
              <div className="search-input-wrap">
                <FiSearch className="search-icon" />
                <input id="search-urls" className="search-input" placeholder="Search links..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="url-table-head">
            <span>Link / Original URL</span>
            <span>Short URL</span>
            <span>Clicks</span>
            <span>Expires</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="center-pad"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <FiLink className="empty-state-icon" />
              <div className="empty-state-title">{search || filter !== "all" ? "No matching links" : "No links yet"}</div>
              <p className="text-sm text-muted">{search || filter !== "all" ? "Adjust the search or filter." : "Paste a URL above to create your first short link."}</p>
            </div>
          ) : (
            filtered.map((u) => {
              const expired = isExpired(u);
              return (
                <div key={u._id}>
                  <div className="url-row">
                    <div className="url-row-original">
                      {u.title && <div className="url-row-title">{u.title}</div>}
                      <div className={u.title ? "url-row-original-url" : "url-row-title"}>{u.originalUrl}</div>
                      {u.createdAt && <div className="url-row-meta">Created {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</div>}
                    </div>

                    <div className="url-row-short">
                      <a href={`${BASE}/${u.shortCode}`} target="_blank" rel="noopener noreferrer" className="url-short-link">
                        <FiLink size={11} /> {u.shortCode} <FiExternalLink size={10} />
                      </a>
                    </div>

                    <div className="clicks-badge"><FiActivity size={14} /> {u.clicks}</div>

                    <div>
                      {!u.expiresAt ? (
                        <span className="expiry-badge no-expiry">No expiry</span>
                      ) : (
                        <span className={`expiry-badge ${expired ? "expired" : "active"}`}>
                          <FiClock size={10} />
                          {expired ? "Expired" : formatDistanceToNow(new Date(u.expiresAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    <div className="url-row-actions">
                      <button className="btn btn-ghost btn-icon" title="Copy" onClick={() => handleCopy(u.shortCode, u._id)}>
                        {copiedId === u._id ? <FiCheck size={15} color="#10b981" /> : <FiCopy size={15} />}
                      </button>
                      <button className="btn btn-ghost btn-icon" title="QR Code" onClick={() => setQrUrl(u)}><FiGrid size={15} /></button>
                      <button className="btn btn-ghost btn-icon" title="Analytics" onClick={() => navigate(`/analytics/${u._id}`)}><FiBarChart2 size={15} /></button>
                      <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => editingId === u._id ? setEditingId(null) : startEdit(u)}><FiEdit2 size={14} /></button>
                      <button className="btn btn-danger btn-icon" title="Delete" onClick={() => handleDelete(u._id)}><FiTrash2 size={14} /></button>
                    </div>
                  </div>

                  {editingId === u._id && (
                    <div className="edit-row">
                      <div className="edit-grid">
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Destination URL</label>
                          <input type="url" className="form-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Title</label>
                          <input className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Expiry</label>
                          <input type="date" className="form-input" value={editExpiry} min={minExpiry.toISOString().split("T")[0]} onChange={(e) => setEditExpiry(e.target.value)} />
                        </div>
                      </div>
                      <div className="edit-row-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => saveEdit(u._id)} disabled={editSaving}>
                          {editSaving ? <div className="spinner spinner-sm" /> : <FiCheck size={14} />} Save
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>

      {qrUrl && <QRModal url={qrUrl} shortUrl={`${BASE}/${qrUrl.shortCode}`} onClose={() => setQrUrl(null)} />}
    </div>
  );
}
