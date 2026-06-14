const rateLimit = require("express-rate-limit");

// Rate limiter for redirect endpoint (public)
const redirectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for API creation
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many URLs created, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { redirectLimiter, createLimiter };
