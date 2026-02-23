require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const lifecycleRoutes = require('./routes/lifecycleRoutes');
const provenanceRoutes = require('./routes/provenanceRoutes');
const poRoutes = require('./routes/purchaseOrderRoutes');
const cors = require("cors");

const app = express();   // ✅ CREATE APP FIRST
app.use(express.json());
app.use(cors());
/* 🔹 MongoDB Connection */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* 🔹 Routes */
app.use('/api/auth', authRoutes);
app.use('/api/batch', lifecycleRoutes);
app.use('/api/provenance', provenanceRoutes);
app.use('/api/po', poRoutes);   // ✅ AFTER app is created

/* 🔹 Health Check */
app.get('/', (req, res) => {
  res.send("Agri Supply Chain Backend Running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
