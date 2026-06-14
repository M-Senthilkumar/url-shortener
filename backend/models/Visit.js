const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Url",
    required: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
  browser: {
    type: String,
    default: "Unknown",
  },
  device: {
    type: String,
    default: "Desktop",
  },
  os: {
    type: String,
    default: "Unknown",
  },
  referrer: {
    type: String,
    default: "Direct",
  },
  ip: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Visit", visitSchema);