const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      unique: true,
      required: true,
    },
    customAlias: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    clicks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: check if expired
urlSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

urlSchema.set("toJSON", { virtuals: true });
urlSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Url", urlSchema);