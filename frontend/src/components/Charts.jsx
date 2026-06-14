import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#667eea", "#4facfe", "#43e97b", "#f093fb", "#fa709a", "#fee140"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(15,12,41,0.97)",
          border: "1px solid rgba(102,126,234,0.3)",
          borderRadius: 10,
          padding: "0.6rem 1rem",
          fontSize: "0.8rem",
          color: "#e2e8f0",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ClickTrendChart({ data }) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // show MM-DD
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          name="Clicks"
          stroke="#667eea"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#667eea" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DevicePieChart({ data }) {
  const entries = Object.entries(data).map(([name, value]) => ({ name, value }));
  if (entries.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={entries}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {entries.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BrowserBarChart({ data }) {
  const entries = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (entries.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={entries} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Clicks" radius={[6, 6, 0, 0]}>
          {entries.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div
      style={{
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        fontSize: "0.85rem",
      }}
    >
      No data yet - share your link to see analytics.
    </div>
  );
}
