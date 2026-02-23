const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createPO,
  acceptPO,
  lockEscrow,
  releasePayment
} = require("../controllers/purchaseOrderController");

router.post("/create", protect, createPO);
router.post("/:id/accept", protect, acceptPO);
router.post("/:id/lock", protect, lockEscrow);
router.post("/:id/release", protect, releasePayment);

module.exports = router;

