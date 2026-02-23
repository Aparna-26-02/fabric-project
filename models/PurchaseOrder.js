const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema({

  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  pricePerUnit: {
    type: Number,
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: [
      "CREATED",
      "ACCEPTED",
      "ESCROW_LOCKED",
      "DELIVERED",
      "PAYMENT_RELEASED",
      "CANCELLED"
    ],
    default: "CREATED"
  },

  escrowStatus: {
    type: String,
    enum: ["UNLOCKED", "LOCKED", "RELEASED"],
    default: "UNLOCKED"
  }

}, { timestamps: true });

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
