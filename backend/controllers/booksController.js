// controllers/booksController.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

// Corrected import path and function name
const { getBestSellersOverview, searchBooksGoogle, transformGoogleBooksResponse } = require('../services/BooksService');

/**
 * Controller to handle fetching the best sellers feed from NYT Books API.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getBooksFeed = async (req, res) => {
  try {
    const cachedData = cache.get('booksFeed');
    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await getBestSellersOverview();
    cache.set('booksFeed', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching books feed:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to fetch books feed' });
  }
};

/**
 * Controller to handle searching books using Google Books API.
 * Accepts query parameters: author, title, isbn.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const searchBooks = async (req, res) => {
  try {
    const { author, title, isbn } = req.query;

    if (!author && !title && !isbn) {
      return res.status(400).json({ error: 'At least one search parameter (author, title, isbn) is required.' });
    }

    const searchParams = { author, title, isbn };
    const data = await searchBooksGoogle(searchParams);

    // Transform the Google API response to match NYT format
    const transformedData = transformGoogleBooksResponse(data);

    res.json(transformedData);
  } catch (error) {
    console.error('Error searching books:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to search books' });
  }
};

module.exports = {
  getBooksFeed,
  searchBooks,
};
