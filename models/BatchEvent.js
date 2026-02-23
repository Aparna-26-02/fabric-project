const mongoose = require("mongoose");

const batchEventSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true
  },

  eventType: {
    type: String,
    enum: [
      "MINTED",
      "QA_PASSED",
      "STORED",
      "DISPATCHED",
      "DELIVERED",
      "PAYMENT_RELEASED"
    ],
    required: true
  },

  actorRole: { type: String, required: true },

  location: { type: String, required: true },

  txHash: String

}, { timestamps: true });

module.exports = mongoose.model("BatchEvent", batchEventSchema);
