// routes/lists.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { clerkClient } = require('@clerk/express');
const { requireAuth } = require('@clerk/express');

/**
 * @route   GET /api/lists
 * @desc    Get all lists and their items for the authenticated user
 * @access  Private
 */
router.get('/', requireAuth(), async (req, res) => {
  const { userId } = req.auth;

  const defaultLists = ['Favorite', 'Want to Read', 'Already Read'];

  try {
    // Get all lists for the user
    const listsResult = await pool.query(
      `SELECT * FROM lists WHERE user_id = $1`,
      [userId]
    );

    let lists = listsResult.rows;

    // Check and create default lists if they don't exist
    for (const listName of defaultLists) {
      if (!lists.some(list => list.name === listName)) {
        const newListResult = await pool.query(
          `INSERT INTO lists (user_id, name, date_created)
           VALUES ($1, $2, NOW())
           RETURNING *`,
          [userId, listName]
        );
        lists.push(newListResult.rows[0]);
      }
    }

    // Fetch list items with book details
    const listsWithItems = await Promise.all(
      lists.map(async (list) => {
        const itemsResult = await pool.query(
          `SELECT li.book_isbn, li.date_added, b.title, b.author, b.book_image
           FROM list_items li
           JOIN books b ON li.book_isbn = b.primary_isbn13
           WHERE li.list_id = $1`,
          [list.list_id]
        );

        const items = itemsResult.rows;

        return {
          ...list,
          items,
        };
      })
    );

    res.json(listsWithItems);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Failed to fetch lists.' });
  }
});

/**
 * @route   POST /api/lists
 * @desc    Create a new list
 * @access  Private
 */
router.post('/', requireAuth(), async (req, res) => {
  const { name } = req.body;
  const { userId } = req.auth;

  if (!name) {
    return res.status(400).json({ error: 'List name is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lists (user_id, name, date_created)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [userId, name]
    );

    const newList = result.rows[0];
    res.status(201).json(newList);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Failed to create list.' });
  }
});

/**
 * @route   POST /api/lists/:list_id/items
 * @desc    Add a book to a list
 * @access  Private
 */
router.post('/:list_id/items', requireAuth(), async (req, res) => {
  const { list_id } = req.params;
  const { book_isbn } = req.body;
  const { userId } = req.auth;

  if (!book_isbn) {
    return res.status(400).json({ error: 'book_isbn is required.' });
  }

  try {
    // Verify that the list belongs to the user
    const listResult = await pool.query(
      `SELECT * FROM lists WHERE list_id = $1 AND user_id = $2`,
      [list_id, userId]
    );

    if (listResult.rows.length === 0) {
      return res.status(404).json({ error: 'List not found.' });
    }

    // Check if the book is already in the list
    const existingItem = await pool.query(
      `SELECT * FROM list_items WHERE list_id = $1 AND book_isbn = $2`,
      [list_id, book_isbn]
    );

    if (existingItem.rows.length > 0) {
      return res.status(400).json({ error: 'Book already in the list.' });
    }

    // Insert the book into the list
    const result = await pool.query(
      `INSERT INTO list_items (list_id, book_isbn, date_added)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [list_id, book_isbn]
    );

    const newItem = result.rows[0];
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding book to list:', error);
    res.status(500).json({ error: 'Failed to add book to list.' });
  }
});

/**
 * @route   DELETE /api/lists/:list_id/items/:book_isbn
 * @desc    Remove a book from a list
 * @access  Private
 */
router.delete('/:list_id/items/:book_isbn', requireAuth(), async (req, res) => {
  const { list_id, book_isbn } = req.params;
  const { userId } = req.auth;

  try {
    // Verify that the list belongs to the user
    const listResult = await pool.query(
      `SELECT * FROM lists WHERE list_id = $1 AND user_id = $2`,
      [list_id, userId]
    );

    if (listResult.rows.length === 0) {
      return res.status(404).json({ error: 'List not found.' });
    }

    // Delete the item
    const deleteResult = await pool.query(
      `DELETE FROM list_items WHERE list_id = $1 AND book_isbn = $2 RETURNING *`,
      [list_id, book_isbn]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found in the list.' });
    }

    res.status(200).json({ message: 'Book removed from the list.' });
  } catch (error) {
    console.error('Error removing book from list:', error);
    res.status(500).json({ error: 'Failed to remove book from list.' });
  }
});

module.exports = router;
