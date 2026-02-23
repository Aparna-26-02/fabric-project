const Batch = require("../models/Batch");
const BatchEvent = require("../models/BatchEvent");
const TransportLog = require("../models/TransportLog");
const crypto = require("crypto");

/* 🔹 Utility: Generate Hash (Blockchain-style simulation) */
const generateHash = (data) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
};

/* 🔹 Utility: Log Event */
const logEvent = async (batchId, eventType, actorRole, location) => {
  const hash = generateHash({
    batchId,
    eventType,
    timestamp: Date.now(),
  });

  await BatchEvent.create({
    batchId,
    eventType,
    actorRole,
    location,
    txHash: hash,
  });
};



// ======================================================
// 1️⃣ CREATE BATCH (Farmer)
// ======================================================
exports.createBatch = async (req, res) => {
  try {
    const { batchId, cropType, quantity, grade, moisture, harvestDate, farmLocation, farmerId } = req.body;

    const existing = await Batch.findOne({ batchId });
    if (existing) {
      return res.status(400).json({ error: "Batch ID already exists" });
    }

    const batch = await Batch.create({
      batchId,
      cropType,
      quantity,
      grade,
      moisture,
      harvestDate,
      farmLocation,
      farmer: farmerId,
      status: "CREATED",
    });

    await logEvent(batch._id, "MINTED", "FARMER", farmLocation);

    res.status(201).json({
      message: "Batch created successfully",
      batch,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ======================================================
// 2️⃣ QA APPROVE (Warehouse)
// ======================================================
exports.qaApprove = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    if (batch.status !== "CREATED") {
      return res.status(400).json({ error: "Batch not in CREATED state" });
    }

    batch.status = "STORED";
    await batch.save();

    await logEvent(batch._id, "QA_PASSED", "WAREHOUSE", "Warehouse");

    res.json({ message: "QA approved successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ======================================================
// 3️⃣ DISPATCH (Distributor)
// ======================================================
exports.dispatchBatch = async (req, res) => {
  try {
    const { vehicleNumber, driverName, destination } = req.body;

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    if (batch.status !== "STORED") {
      return res.status(400).json({ error: "Batch not ready for dispatch" });
    }

    batch.status = "IN_TRANSIT";
    await batch.save();

    const transport = await TransportLog.create({
      batchId: batch._id,
      transportId: "TRANS_" + Date.now(),
      origin: batch.farmLocation,
      destination,
      vehicleNumber,
      driverName,
      dispatchTime: new Date(),
      liveStatus: "IN_TRANSIT",
    });

    await logEvent(batch._id, "DISPATCHED", "DISTRIBUTOR", destination);

    res.json({
      message: "Batch dispatched successfully",
      transport,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ======================================================
// 4️⃣ DELIVER (Retailer)
// ======================================================
exports.deliverBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    if (batch.status !== "IN_TRANSIT") {
      return res.status(400).json({ error: "Batch not in transit" });
    }

    batch.status = "DELIVERED";
    await batch.save();

    await TransportLog.findOneAndUpdate(
      { batchId: batch._id },
      {
        deliveryTime: new Date(),
        liveStatus: "DELIVERED",
      }
    );

    await logEvent(batch._id, "DELIVERED", "RETAILER", "Retail Store");

    res.json({ message: "Batch delivered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ======================================================
// 5️⃣ RELEASE PAYMENT (Regulator / Finance)
// ======================================================
exports.releasePayment = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    if (batch.status !== "DELIVERED") {
      return res.status(400).json({ error: "Payment can only be released after delivery" });
    }

    await logEvent(batch._id, "PAYMENT_RELEASED", "REGULATOR", "Bank");

    res.json({ message: "Payment released to farmer" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
