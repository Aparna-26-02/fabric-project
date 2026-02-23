const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },

  farmerId: { type: String, required: true },

  crop: {
    type: { type: String, required: true },
    variety: { type: String, required: true }
  },

  quantity: {
    value: { type: Number, required: true },
    unit: { type: String, required: true }
  },

  quality: {
    estimatedGrade: { type: String },
    moisturePercent: { type: Number }
  },

  harvestDate: { type: Date, required: true },

  location: {
    state: String,
    district: String,
    village: String,
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
      }
    }
  },

  documents: {
    photos: [String],
    certificates: [String]
  },

  lifecycle: {
    status: {
      type: String,
      default: "CREATED"
    },
    currentHolder: {
      type: String,
      default: "FARMER"
    },
    history: [
      {
        event: String,
        actorId: String,
        actorRole: String,
        timestamp: Date
      }
    ]
  },

  blockchain: {
    txId: String,
    lastHash: String
  }

}, { timestamps: true });

batchSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Batch", batchSchema);