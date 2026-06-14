export default function StatsCard({ icon, value, label, gradient, iconBg }) {
  return (
    <div className="stats-card">
      <div className="stats-card-icon" style={{ background: iconBg || "rgba(102,126,234,0.15)" }}>
        {icon}
      </div>
      <div className="stats-card-body">
        <div
          className="stats-card-value grad-text"
          style={{
            background: gradient || "linear-gradient(135deg,#667eea,#764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {value ?? "-"}
        </div>
        <div className="stats-card-label">{label}</div>
      </div>
    </div>
  );
}
