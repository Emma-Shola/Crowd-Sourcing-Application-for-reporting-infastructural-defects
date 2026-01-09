const mongoose = require("mongoose");

const defectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["normal", "urgent", "hazardous", "recyclable"],
      default: "normal",
    },

    status: {
      type: String,
      enum: ["pending", "verified", "in_progress", "resolved", "rejected"],
      default: "pending",
    },

    location: {
      text: { type: String, required: true },
      latitude: Number,
      longitude: Number
    },

    // store multiple image paths
    imageUrl: {
      type: [String],
      default: [],
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    // ⭐ NEW FEATURE: Admin -> User messages
    adminComments: [
  {
    message: String,
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }
],

notifications: [
  {
    text: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }
]


  },
  { timestamps: true }
);

module.exports = mongoose.model("Defect", defectSchema);
