const express = require("express");
const router = express.Router();
const { getProvenance } = require("../controllers/provenanceController");

// Public QR route (no auth)
router.get("/:id", getProvenance);

module.exports = router;
