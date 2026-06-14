const router = require("express").Router();
const Visit = require("../models/Visit");
const Url = require("../models/Url");
const auth = require("../middleware/authMiddleware");

// Helper: build daily trend for last N days
function buildDailyTrend(visits, days = 30) {
  const trend = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    trend[key] = 0;
  }
  visits.forEach((v) => {
    const key = new Date(v.visitedAt).toISOString().split("T")[0];
    if (trend[key] !== undefined) trend[key]++;
  });
  return Object.entries(trend).map(([date, count]) => ({ date, count }));
}

// Helper: count breakdown by field
function countByField(visits, field) {
  return visits.reduce((acc, v) => {
    const key = v[field] || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

// GET /api/analytics/:id — authenticated analytics by URL id
router.get("/:id", auth, async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user.id });
    if (!url) return res.status(404).json({ message: "URL not found." });

    const visits = await Visit.find({ urlId: req.params.id }).sort({ visitedAt: -1 });

    const totalClicks = visits.length;
    const lastVisited = visits.length > 0 ? visits[0].visitedAt : null;
    const recentVisits = visits.slice(0, 20);
    const dailyTrend = buildDailyTrend(visits, 30);
    const deviceBreakdown = countByField(visits, "device");
    const browserBreakdown = countByField(visits, "browser");
    const osBreakdown = countByField(visits, "os");

    res.json({
      url,
      totalClicks,
      lastVisited,
      recentVisits,
      dailyTrend,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Failed to fetch analytics." });
  }
});

// GET /api/analytics/public/:shortCode — public stats (no auth)
router.get("/public/:shortCode", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });
    if (!url) return res.status(404).json({ message: "URL not found." });

    const visits = await Visit.find({ urlId: url._id }).sort({ visitedAt: -1 });

    const totalClicks = visits.length;
    const lastVisited = visits.length > 0 ? visits[0].visitedAt : null;
    const dailyTrend = buildDailyTrend(visits, 30);
    const deviceBreakdown = countByField(visits, "device");
    const browserBreakdown = countByField(visits, "browser");

    res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      title: url.title,
      createdAt: url.createdAt,
      totalClicks,
      lastVisited,
      dailyTrend,
      deviceBreakdown,
      browserBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch public stats." });
  }
});

module.exports = router;