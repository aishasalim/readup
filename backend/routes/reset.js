const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth } = require("@clerk/express");
const { clerkClient } = require("@clerk/express");

const isAdmin = async (req, res, next) => {
  const { userId } = req.auth;

  try {
    // Fetch user data from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Check if user is admin
    if (user.id === process.env.ADMIN_USER_ID) {
      next();
    } else {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @route   POST /api/reset
 * @desc    Reset the database
 * @access  Private
 */
router.post("/", requireAuth(), isAdmin, async (req, res) => {
  try {
    // Truncate the reviews and lists tables
    await pool.query("TRUNCATE TABLE reviews, lists RESTART IDENTITY CASCADE");

    // Optionally, insert default data here

    res.status(200).json({ message: "Database reset successfully." });
  } catch (error) {
    console.error("Error resetting database:", error);
    res.status(500).json({ error: "Failed to reset database." });
  }
});

module.exports = router;
