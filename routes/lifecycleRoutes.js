const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createBatch,
  qaApprove,
  dispatchBatch,
  deliverBatch,
  releasePayment
} = require("../controllers/lifecycleController");

// Import middleware functions (IMPORTANT: destructuring)
const { protect, authorize } = require("../middleware/authMiddleware");


// ======================================================
// 1️⃣ Farmer - Create Batch
// ======================================================
router.post(
  "/create",
  protect,
  authorize("FARMER"),
  createBatch
);


// ======================================================
// 2️⃣ Warehouse - QA Approve
// ======================================================
router.post(
  "/:id/qa",
  protect,
  authorize("WAREHOUSE"),
  qaApprove
);


// ======================================================
// 3️⃣ Distributor - Dispatch
// ======================================================
router.post(
  "/:id/dispatch",
  protect,
  authorize("DISTRIBUTOR"),
  dispatchBatch
);


// ======================================================
// 4️⃣ Retailer - Deliver
// ======================================================
router.post(
  "/:id/deliver",
  protect,
  authorize("RETAILER"),
  deliverBatch
);


// ======================================================
// 5️⃣ Regulator - Release Payment
// ======================================================
router.post(
  "/:id/payment",
  protect,
  authorize("REGULATOR"),
  releasePayment
);

module.exports = router;
