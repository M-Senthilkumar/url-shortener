import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiArrowLeft, FiCheck, FiDownload, FiFileText, FiFolder, FiUpload, FiX } from "react-icons/fi";
import Navbar from "../components/Navbar";
import api from "../api";

const BASE = "http://localhost:5000";
const SAMPLE_CSV = `url,title
https://www.google.com,Google Search
https://www.github.com,GitHub
https://www.youtube.com,YouTube`;

export default function BulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [parsed, setParsed] = useState([]);
  const [results, setResults] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const processFile = (file) => {
    if (!file || !file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file.");
      return;
    }

    setFileName(file.name);
    setResults([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data
          .filter((r) => r.url || r.URL || r.originalUrl)
          .map((r) => ({
            originalUrl: (r.url || r.URL || r.originalUrl || "").trim(),
            title: (r.title || r.Title || "").trim(),
          }))
          .filter((r) => r.originalUrl);

        if (rows.length === 0) {
          toast.error('CSV must have a "url" column with valid URLs.');
          return;
        }

        if (rows.length > 50) {
          toast.error("Maximum 50 URLs per bulk upload.");
          setParsed(rows.slice(0, 50));
          return;
        }

        setParsed(rows);
        toast.success(`${rows.length} URLs loaded from CSV.`);
      },
      error: () => toast.error("Failed to parse CSV."),
    });
  };

  const handleSubmit = async () => {
    if (parsed.length === 0) {
      toast.error("No URLs to upload.");
      return;
    }

    setUploading(true);
    try {
      const res = await api.post("/url/bulk", { urls: parsed });
      setResults(res.data.created);
      setParsed([]);
      setFileName("");

      if (res.data.errors.length > 0) {
        toast(`${res.data.created.length} created, ${res.data.errors.length} failed.`, { icon: <FiAlertTriangle /> });
      } else {
        toast.success(`${res.data.created.length} links created successfully.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "linksnap-sample.csv";
    a.click();
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")} style={{ marginBottom: "1rem", paddingLeft: 0 }}>
          <FiArrowLeft size={15} /> Back to Dashboard
        </button>

        <div className="page-header">
          <div>
            <p className="eyebrow">High-volume shortening</p>
            <h1 className="page-title"><span className="grad-text">Bulk URL Upload</span></h1>
            <p className="page-subtitle">Upload a CSV to shorten up to 50 URLs at once.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={downloadSample}>
            <FiDownload size={14} /> Download Sample CSV
          </button>
        </div>

        <section
          className={`card dropzone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => { processFile(e.target.files[0]); e.target.value = ""; }} />
          <div className="dropzone-icon">{fileName ? <FiFileText /> : <FiFolder />}</div>
          <div className="dropzone-title">{fileName || "Drop your CSV file here"}</div>
          <div className="dropzone-subtitle">
            {fileName ? `${parsed.length} URLs ready to shorten - click to choose a different file` : 'or click to browse - must have a "url" column'}
          </div>
        </section>

        {parsed.length > 0 && (
          <section className="card bulk-section">
            <div className="bulk-section-head">
              <h3>Preview - {parsed.length} URLs</h3>
              <div className="button-wrap">
                <button className="btn btn-secondary btn-sm" onClick={() => { setParsed([]); setFileName(""); }}><FiX size={13} /> Clear</button>
                <button id="bulk-shorten-btn" className="btn btn-primary" onClick={handleSubmit} disabled={uploading}>
                  {uploading ? <><div className="spinner spinner-sm" /> Shortening...</> : <><FiUpload size={14} /> Shorten All {parsed.length} URLs</>}
                </button>
              </div>
            </div>

            <TableWrap>
              <table className="bulk-preview-table">
                <thead><tr><th>#</th><th>URL</th><th>Title</th></tr></thead>
                <tbody>
                  {parsed.map((row, i) => (
                    <tr key={`${row.originalUrl}-${i}`}>
                      <td className="table-index">{i + 1}</td>
                      <td>{row.originalUrl}</td>
                      <td>{row.title || <span className="text-muted">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </section>
        )}

        {results.length > 0 && (
          <section className="card bulk-section">
            <h3 className="bulk-success-title"><FiCheck color="#10b981" /> {results.length} Links Created Successfully</h3>
            <TableWrap>
              <table className="bulk-preview-table">
                <thead><tr><th>#</th><th>Original URL</th><th>Short Link</th><th>Clicks</th></tr></thead>
                <tbody>
                  {results.map((url, i) => (
                    <tr key={url._id}>
                      <td className="table-index">{i + 1}</td>
                      <td>{url.originalUrl}</td>
                      <td><a href={`${BASE}/${url.shortCode}`} target="_blank" rel="noopener noreferrer" className="table-link">{BASE}/{url.shortCode}</a></td>
                      <td>{url.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/dashboard")}>View in Dashboard</button>
            </div>
          </section>
        )}

        {parsed.length === 0 && results.length === 0 && (
          <section className="card bulk-section">
            <h3 className="bulk-guide-title"><FiFileText /> CSV Format Guide</h3>
            <TableWrap>
              <table className="bulk-preview-table">
                <thead><tr><th>url</th><th>title (optional)</th></tr></thead>
                <tbody>
                  <tr><td>https://www.google.com</td><td>Google Search</td></tr>
                  <tr><td>https://www.github.com</td><td>GitHub</td></tr>
                  <tr><td>https://www.youtube.com</td><td></td></tr>
                </tbody>
              </table>
            </TableWrap>
            <ul className="bulk-guide-list">
              <li>The url column is required.</li>
              <li>The title column is optional.</li>
              <li>Maximum 50 URLs per upload.</li>
              <li>URLs must include http:// or https://.</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function TableWrap({ children }) {
  return <div className="table-wrap">{children}</div>;
}
