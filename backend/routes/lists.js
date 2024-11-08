// routes/lists.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth } = require("@clerk/express");

/**
 * @route   GET /api/lists
 * @desc    Get all lists for the authenticated user
 * @access  Private
 */
router.get("/", requireAuth, async (req, res) => {
  const { userId } = req.auth;
  console.log("GET /api/lists called by User ID:", userId);

  try {
    // Fetch lists for the user
    let result = await pool.query(`SELECT * FROM lists WHERE user_id = $1`, [
      userId,
    ]);
    let lists = result.rows;
    console.log(`Found ${lists.length} lists for user ${userId}`);

    // If the user has no lists, create default lists
    if (lists.length === 0) {
      const defaultLists = ["Favorites", "Want to Read", "Already Read"];
      console.log(`Creating default lists for user ${userId}:`, defaultLists);

      const insertQueries = defaultLists.map((listName) => {
        return pool.query(
          `INSERT INTO lists (user_id, name) VALUES ($1, $2) RETURNING *`,
          [userId, listName]
        );
      });

      const insertResults = await Promise.all(insertQueries);
      lists = insertResults.map((result) => result.rows[0]);
      console.log(`Default lists created for user ${userId}:`, lists);
    }

    res.json(lists);
    console.log(`Responded with ${lists.length} lists for user ${userId}`);
  } catch (error) {
    console.error("Error fetching lists:", error);
    res.status(500).json({ error: "Failed to fetch lists." });
  }
});

/**
 * @route   POST /api/lists
 * @desc    Create a new list for the authenticated user
 * @access  Private
 */
router.post("/", requireAuth, async (req, res) => {
  console.log("POST /api/lists called");
  const { userId } = req.auth;
  console.log("User ID:", userId);
  const { name } = req.body;

  if (!name || !name.trim()) {
    console.log("List name is empty.");
    return res.status(400).json({ error: "List name cannot be empty." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lists (user_id, name) VALUES ($1, $2) RETURNING *`,
      [userId, name.trim()]
    );
    const newList = result.rows[0];
    console.log("New list created:", newList);
    res.status(201).json(newList);
  } catch (error) {
    console.error("Error creating new list:", error);
    res.status(500).json({ error: "Failed to create list." });
  }
});

/**
 * @route   POST /api/lists/:list_id/items
 * @desc    Add a book to a list
 * @access  Private
 */
router.post("/:list_id/items", requireAuth, async (req, res) => {
  const { userId } = req.auth;
  const { list_id } = req.params;
  const { book_isbn } = req.body;

  console.log(`POST /api/lists/${list_id}/items called by User ID: ${userId}`);

  if (!book_isbn) {
    console.log("Book ISBN is missing.");
    return res.status(400).json({ error: "Book ISBN is required." });
  }

  try {
    // Verify the list belongs to the user
    const listResult = await pool.query(
      `SELECT * FROM lists WHERE list_id = $1 AND user_id = $2`,
      [list_id, userId]
    );

    if (listResult.rows.length === 0) {
      console.log(
        `List ID ${list_id} not found or unauthorized for user ${userId}`
      );
      return res.status(404).json({ error: "List not found or unauthorized." });
    }

    // Add the book to the list
    await pool.query(
      `INSERT INTO list_items (list_id, book_isbn) VALUES ($1, $2)`,
      [list_id, book_isbn]
    );

    console.log(
      `Book ISBN ${book_isbn} added to list ID ${list_id} for user ${userId}`
    );
    res.status(201).json({ message: "Book added to list successfully." });
  } catch (error) {
    console.error("Error adding book to list:", error);
    res.status(500).json({ error: "Failed to add book to list." });
  }
});

module.exports = router;
