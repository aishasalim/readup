// backend/index.js
require("dotenv").config(); // Load environment variables first
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { clerkMiddleware } = require("@clerk/express");
const morgan = require("morgan"); // Optional: For logging
const path = require("path"); // Add this line

const app = express();

// Middleware

// 1. CORS Middleware
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// // 1. CORS Middleware
app.use(
  cors({
    origin: "https://readup-production.up.railway.app", // Remove trailing slash
    credentials: true,
  })
);

// 2. Morgan Logging Middleware
app.use(morgan("dev")); // Logging middleware should be early to log all requests

// 3. Cookie Parser Middleware
app.use(cookieParser()); // Parse cookies before Clerk middleware

// 4. JSON Body Parser
app.use(express.json()); // Parse JSON bodies

// 5. Clerk Middleware
app.use(clerkMiddleware()); // Clerk middleware for authentication

// Import the PostgreSQL pool
const pool = require("./db");

// Routes
const resetRoutes = require("./routes/reset");
const booksRouter = require("./routes/books");
const reviewsRouter = require("./routes/reviews");
const listsRouter = require("./routes/lists");

app.use("/api/reset", resetRoutes);
app.use("/api/books", booksRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/lists", listsRouter);

// Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Serve frontend's index.html for any non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the pool for use in other modules if needed
module.exports = pool;
