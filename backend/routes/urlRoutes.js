const router = require("express").Router();
const Url = require("../models/Url");
const Visit = require("../models/Visit");
const auth = require("../middleware/authMiddleware");
const validator = require("validator");
const crypto = require("crypto");
const { createLimiter } = require("../middleware/rateLimiter");

const RESERVED_CODES = new Set(["api", "stats", "dashboard", "bulk", "login", "register", "favicon.ico"]);

function normalizeAlias(alias = "") {
  return alias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
}

function generateCode(size = 7) {
  return crypto
    .randomBytes(size)
    .toString("base64url")
    .replace(/[-_]/g, "")
    .slice(0, size);
}

async function createUniqueShortCode() {
  let shortCode;
  let unique = false;

  while (!unique) {
    shortCode = generateCode();
    const exists = await Url.findOne({ shortCode });
    if (!exists && !RESERVED_CODES.has(shortCode)) unique = true;
  }

  return shortCode;
}

// POST /api/url/create
router.post("/create", auth, createLimiter, async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt, title } = req.body;
    const cleanOriginalUrl = typeof originalUrl === "string" ? originalUrl.trim() : "";

    // Validate URL
    if (!cleanOriginalUrl)
      return res.status(400).json({ message: "URL is required." });

    if (!validator.isURL(cleanOriginalUrl, { require_protocol: true, protocols: ["http", "https"] }))
      return res.status(400).json({ message: "Please enter a valid URL including http:// or https://" });

    // Validate expiry date
    if (expiresAt && new Date(expiresAt) <= new Date())
      return res.status(400).json({ message: "Expiry date must be in the future." });

    // Handle custom alias
    let shortCode;
    if (customAlias) {
      const aliasClean = normalizeAlias(customAlias);
      if (!aliasClean || aliasClean.length < 3)
        return res.status(400).json({ message: "Custom alias must be at least 3 characters (letters, numbers, - or _)." });

      if (RESERVED_CODES.has(aliasClean))
        return res.status(400).json({ message: "That alias is reserved. Try another." });

      const exists = await Url.findOne({ shortCode: aliasClean });
      if (exists)
        return res.status(409).json({ message: "This custom alias is already taken. Try another." });

      shortCode = aliasClean;
    } else {
      shortCode = await createUniqueShortCode();
    }

    const url = await Url.create({
      originalUrl: cleanOriginalUrl,
      shortCode,
      customAlias: customAlias ? shortCode : null,
      title: typeof title === "string" ? title.trim().slice(0, 120) : "",
      expiresAt: expiresAt || null,
      user: req.user.id,
    });

    res.status(201).json(url);
  } catch (err) {
    console.error("Create URL error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// GET /api/url — get all URLs for current user
router.get("/", auth, async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch URLs." });
  }
});

// GET /api/url/stats/summary — dashboard summary stats
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user.id });
    const totalLinks = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);
    const activeLinks = urls.filter(
      (u) => u.isActive && (!u.expiresAt || new Date(u.expiresAt) > new Date())
    ).length;
    const topUrl = urls.sort((a, b) => b.clicks - a.clicks)[0] || null;

    res.json({ totalLinks, totalClicks, activeLinks, topUrl });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary." });
  }
});

// PUT /api/url/:id — edit original URL
router.put("/:id", auth, async (req, res) => {
  try {
    const { originalUrl, title, expiresAt } = req.body;
    const cleanOriginalUrl = typeof originalUrl === "string" ? originalUrl.trim() : "";

    if (cleanOriginalUrl && !validator.isURL(cleanOriginalUrl, { require_protocol: true, protocols: ["http", "https"] }))
      return res.status(400).json({ message: "Please enter a valid URL including http:// or https://" });

    if (expiresAt && new Date(expiresAt) <= new Date())
      return res.status(400).json({ message: "Expiry date must be in the future." });

    const url = await Url.findOne({ _id: req.params.id, user: req.user.id });
    if (!url)
      return res.status(404).json({ message: "URL not found or not authorized." });

    if (cleanOriginalUrl) url.originalUrl = cleanOriginalUrl;
    if (title !== undefined) url.title = typeof title === "string" ? title.trim().slice(0, 120) : "";
    if (expiresAt !== undefined) url.expiresAt = expiresAt || null;

    await url.save();
    res.json(url);
  } catch (err) {
    console.error("Edit URL error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// DELETE /api/url/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user.id });
    if (!url)
      return res.status(404).json({ message: "URL not found or not authorized." });

    await Url.findByIdAndDelete(req.params.id);
    await Visit.deleteMany({ urlId: req.params.id });

    res.json({ message: "URL deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// POST /api/url/bulk — bulk create from array
router.post("/bulk", auth, createLimiter, async (req, res) => {
  try {
    const { urls } = req.body; // [{ originalUrl, title? }]

    if (!Array.isArray(urls) || urls.length === 0)
      return res.status(400).json({ message: "Please provide an array of URLs." });

    if (urls.length > 50)
      return res.status(400).json({ message: "Maximum 50 URLs per bulk upload." });

    const results = [];
    const errors = [];

    for (const item of urls) {
      const { originalUrl, title } = item;
      const cleanOriginalUrl = typeof originalUrl === "string" ? originalUrl.trim() : "";

      if (!cleanOriginalUrl || !validator.isURL(cleanOriginalUrl, { require_protocol: true, protocols: ["http", "https"] })) {
        errors.push({ originalUrl, error: "Invalid URL" });
        continue;
      }

      const shortCode = await createUniqueShortCode();

      const url = await Url.create({
        originalUrl: cleanOriginalUrl,
        shortCode,
        title: typeof title === "string" ? title.trim().slice(0, 120) : "",
        user: req.user.id,
      });

      results.push(url);
    }

    res.status(201).json({ created: results, errors });
  } catch (err) {
    console.error("Bulk create error:", err);
    res.status(500).json({ message: "Server error during bulk creation." });
  }
});

module.exports = router;
