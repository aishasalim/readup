// routes/books.js
const express = require('express');
const router = express.Router();
const { getBooksFeed, searchBooks } = require('../controllers/booksController');

// Route to get bestsellers feed
router.get('/feed', getBooksFeed);

// Route to search books
router.get('/search', searchBooks);

module.exports = router;

