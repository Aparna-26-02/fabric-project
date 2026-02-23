const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("Agri Blockchain Backend Running 🚀");
});

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/agri_blockchain")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
