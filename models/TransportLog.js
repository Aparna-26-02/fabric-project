const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({

  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true
  },

  transportId: {
    type: String,
    required: true,
    unique: true
  },

  vehicleNumber: {
    type: String
  },

  driverName: {
    type: String
  },

  origin: {
    type: String
  },

  destination: {
    type: String
  },

  currentLocation: {
    type: String
  },

  dispatchTime: {
    type: Date
  },

  deliveryTime: {
    type: Date
  },

  liveStatus: {
    type: String,
    enum: ["IN_TRANSIT", "DELIVERED"],
    default: "IN_TRANSIT"
  },

  temperatureStatus: {
    type: String,
    enum: ["COLD_CHAIN_OK", "BREACH"],
    default: "COLD_CHAIN_OK"
  },

  slaStatus: {
    type: String,
    enum: ["MET", "DELAYED"]
  }

}, { timestamps: true });

module.exports = mongoose.model("TransportLog", transportSchema);
