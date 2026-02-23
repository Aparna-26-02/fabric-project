const PurchaseOrder = require("../models/PurchaseOrder");
const Batch = require("../models/Batch");
const BatchEvent = require("../models/BatchEvent");


// 1️⃣ Create Purchase Order
exports.createPO = async (req, res) => {
  try {
    const { batchId, quantity, pricePerUnit, sellerId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    const totalAmount = quantity * pricePerUnit;

    const po = await PurchaseOrder.create({
      batch: batchId,
      buyer: req.user.id,
      seller: sellerId,
      quantity,
      pricePerUnit,
      totalAmount
    });

    res.status(201).json({
      message: "Purchase Order created",
      po
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 2️⃣ Accept PO (Seller accepts)
exports.acceptPO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) return res.status(404).json({ error: "PO not found" });

    if (po.status !== "CREATED") {
      return res.status(400).json({ error: "Invalid state" });
    }

    po.status = "ACCEPTED";
    await po.save();

    res.json({ message: "PO accepted", po });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 3️⃣ Lock Escrow (Simulated)
exports.lockEscrow = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) return res.status(404).json({ error: "PO not found" });

    if (po.status !== "ACCEPTED") {
      return res.status(400).json({ error: "PO must be accepted first" });
    }

    po.status = "ESCROW_LOCKED";
    po.escrowStatus = "LOCKED";
    await po.save();

    res.json({ message: "Escrow locked", po });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 4️⃣ Auto Release Payment (After Delivery)
exports.releasePayment = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) return res.status(404).json({ error: "PO not found" });

    if (po.escrowStatus !== "LOCKED") {
      return res.status(400).json({ error: "Escrow not locked" });
    }

    po.status = "PAYMENT_RELEASED";
    po.escrowStatus = "RELEASED";
    await po.save();

    await BatchEvent.create({
      batchId: po.batch,
      eventType: "PAYMENT_RELEASED",
      actorRole: "REGULATOR",
      location: "System"
    });

    res.json({ message: "Payment released to seller", po });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
