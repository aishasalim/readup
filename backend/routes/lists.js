const express = require("express");
const router = express.Router();
const { requireAuth } = require("@clerk/express");
const db = require("../db");

// Helper function to ensure default lists exist for a user
async function ensureDefaultLists(userId) {
  // Check if the user has any lists
  const listsResult = await db.query("SELECT * FROM lists WHERE user_id = $1", [
    userId,
  ]);

  let lists = listsResult.rows;

  if (lists.length === 0) {
    // User has no lists, create default lists
    const defaultLists = ["Favorite", "Reading", "Past"];

    const insertPromises = defaultLists.map((listName) =>
      db.query(
        "INSERT INTO lists (user_id, name) VALUES ($1, $2) RETURNING *",
        [userId, listName]
      )
    );

    const insertResults = await Promise.all(insertPromises);

    // Collect the newly created lists
    lists = insertResults.map((result) => result.rows[0]);
  }

  return lists;
}

// Get all lists for the authenticated user, including their books
router.get("/", requireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  console.log(`Fetching lists for user: ${userId}`); // Debug log

  try {
    const lists = await ensureDefaultLists(userId);

    // Fetch books for each list
    const listsWithBooks = await Promise.all(
      lists.map(async (list) => {
        const booksResult = await db.query(
          "SELECT * FROM user_book_lists WHERE user_id = $1 AND list_id = $2",
          [userId, list.id]
        );
        return {
          ...list,
          items: booksResult.rows, // Assign books to 'items'
        };
      })
    );

    res.json(listsWithBooks);
  } catch (err) {
    console.error("Error fetching lists:", err);
    res.status(500).json({ error: "Failed to fetch lists" });
  }
});

// Create a new list
router.post("/", requireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { name } = req.body;
  console.log(`Creating new list for user: ${userId} with name: ${name}`); // Debug log

  if (!name) {
    return res.status(400).json({ error: "List name is required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO lists (user_id, name) VALUES ($1, $2) RETURNING *",
      [userId, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating list:", err);
    res.status(500).json({ error: "Failed to create list" });
  }
});

// Add a book to a list
router.post("/:listId/items", requireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const listId = req.params.listId;
  const { book_isbn, book_name, book_cover_photo, book_description } = req.body;
  console.log(`Adding book to list: ${listId} for user: ${userId}`); // Debug log

  try {
    const listResult = await db.query(
      "SELECT * FROM lists WHERE id = $1 AND user_id = $2",
      [listId, userId]
    );
    if (listResult.rows.length === 0) {
      return res.status(404).json({ error: "List not found" });
    }

    await db.query(
      "INSERT INTO user_book_lists (user_id, list_id, book_isbn, book_name, book_cover_photo, book_description) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, listId, book_isbn, book_name, book_cover_photo, book_description]
    );

    res.status(201).json({ message: "Book added to list" });
  } catch (err) {
    console.error("Error adding book to list:", err);
    if (err.code === "23505") {
      // PostgreSQL unique_violation error code
      res.status(409).json({ error: "The book is already in the list." });
    } else {
      res.status(500).json({ error: "Failed to add book to list" });
    }
  }
});

module.exports = router;
