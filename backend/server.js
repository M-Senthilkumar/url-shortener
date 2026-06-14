const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UAParser = require("ua-parser-js");
require("dotenv").config();

const Url = require("./models/Url");
const Visit = require("./models/Visit");
const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { redirectLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);
app.use("/api/analytics", analyticsRoutes);

function statusPage({ title, heading, message, accent = "#667eea", status = "LinkSnap" }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title} - LinkSnap</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 20% 20%, rgba(102,126,234,.28), transparent 32rem),
            radial-gradient(circle at 80% 75%, rgba(20,184,166,.18), transparent 28rem),
            #090817;
          color: white; padding: 24px;
        }
        .card {
          width: min(440px, 100%); background: rgba(255,255,255,.07); backdrop-filter: blur(22px);
          border: 1px solid rgba(255,255,255,.14); padding: 34px; border-radius: 22px;
          box-shadow: 0 20px 80px rgba(0,0,0,.38); text-align: center;
        }
        .badge {
          display: inline-flex; align-items: center; justify-content: center; height: 42px; min-width: 42px;
          padding: 0 14px; border-radius: 12px; background: ${accent}; color: white;
          font-weight: 800; margin-bottom: 18px; box-shadow: 0 0 30px ${accent}66;
        }
        h1 { font-size: 1.7rem; margin-bottom: 8px; }
        p { color: rgba(226,232,240,.78); line-height: 1.6; margin-bottom: 24px; }
        a {
          display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 20px;
          background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none;
          border-radius: 12px; font-weight: 700;
        }
      </style>
    </head>
    <body>
      <main class="card">
        <div class="badge">${status}</div>
        <h1>${heading}</h1>
        <p>${message}</p>
        <a href="${FRONTEND_URL}">Go to LinkSnap</a>
      </main>
    </body>
    </html>
  `;
}

app.get("/:shortCode", redirectLimiter, async (req, res) => {
  try {
    const { shortCode } = req.params;
    if (shortCode === "favicon.ico") return res.status(404).end();

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send(statusPage({
        title: "Link Not Found",
        heading: "Link not found",
        message: "This short link does not exist or has been deleted.",
        status: "404",
      }));
    }

    if (!url.isActive) {
      return res.status(410).send(statusPage({
        title: "Link Paused",
        heading: "This link is paused",
        message: "The creator has temporarily disabled this short link.",
        accent: "#f59e0b",
        status: "Paused",
      }));
    }

    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).send(statusPage({
        title: "Link Expired",
        heading: "Link expired",
        message: `This link expired on ${new Date(url.expiresAt).toLocaleDateString()}. The creator can renew it from their dashboard.`,
        accent: "#ef4444",
        status: "Expired",
      }));
    }

    const parser = new UAParser(req.headers["user-agent"] || "");
    const result = parser.getResult();
    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";
    const device = result.device.type === "mobile"
      ? "Mobile"
      : result.device.type === "tablet"
        ? "Tablet"
        : "Desktop";

    url.clicks += 1;
    await url.save();

    await Visit.create({
      urlId: url._id,
      browser,
      device,
      os,
      referrer: req.headers.referer || req.headers.referrer || "Direct",
      ip: req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "",
    });

    res.redirect(302, url.originalUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send(statusPage({
      title: "Server Error",
      heading: "Something went wrong",
      message: "LinkSnap could not process this redirect. Please try again shortly.",
      accent: "#ef4444",
      status: "500",
    }));
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
