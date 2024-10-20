// routes/reviews.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { clerkClient } = require('@clerk/express'); // Updated import
const { requireAuth } = require('@clerk/express');

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', requireAuth(), async (req, res) => {
  const { book_isbn, review_text, stars } = req.body;
  const { userId } = req.auth;

  // Input validation
  if (!book_isbn || !review_text || !stars) {
    return res.status(400).json({ error: 'book_isbn, review_text, and stars are required.' });
  }

  if (stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'stars must be between 1 and 5.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, book_isbn, review_text, stars)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, book_isbn, review_text, stars]
    );

    const review = result.rows[0];

    // Fetch user data from Clerk
    try {
      const user = await clerkClient.users.getUser(userId); // Updated code
      review.nickname = user.username || user.firstName || 'Anonymous';
      review.profile_image_url = user.profileImageUrl || '';
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      review.nickname = 'Anonymous';
      review.profile_image_url = '';
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review.' });
  }
});

/**
 * @route   GET /api/reviews/:isbn
 * @desc    Get all reviews for a specific book
 * @access  Public
 */
router.get('/:isbn', async (req, res) => {
  const { isbn } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM reviews
       WHERE book_isbn = $1
       ORDER BY upvotes DESC, date_created DESC`,
      [isbn]
    );

    const reviews = await Promise.all(
      result.rows.map(async (review) => {
        try {
          const user = await clerkClient.users.getUser(review.user_id); // Updated code
          return {
            ...review,
            nickname: user.username || user.firstName || 'Anonymous',
            profile_image_url: user.profileImageUrl || '',
          };
        } catch (err) {
          console.error(`Error fetching user ${review.user_id}:`, err);
          return {
            ...review,
            nickname: 'Anonymous',
            profile_image_url: '',
          };
        }
      })
    );

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

/**
 * @route   POST /api/reviews/:review_id/upvote
 * @desc    Upvote a review
 * @access  Private
 */
router.post('/:review_id/upvote', requireAuth(), async (req, res) => {
  const { review_id } = req.params;
  const { userId } = req.auth;

  try {
    // Check if the user has already upvoted this review
    const checkResult = await pool.query(
      `SELECT * FROM upvotes WHERE review_id = $1 AND user_id = $2`,
      [review_id, userId]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'You have already upvoted this review.' });
    }

    // Insert the upvote
    await pool.query(
      `INSERT INTO upvotes (review_id, user_id)
       VALUES ($1, $2)`,
      [review_id, userId]
    );

    // Increment the upvotes count in the reviews table
    const result = await pool.query(
      `UPDATE reviews
       SET upvotes = upvotes + 1
       WHERE review_id = $1
       RETURNING *`,
      [review_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const review = result.rows[0];

    // Fetch user data from Clerk
    try {
      const user = await clerkClient.users.getUser(review.user_id); // Updated code
      review.nickname = user.username || user.firstName || 'Anonymous';
      review.profile_image_url = user.profileImageUrl || '';
    } catch (err) {
      console.error(`Error fetching user ${review.user_id}:`, err);
      review.nickname = 'Anonymous';
      review.profile_image_url = '';
    }

    res.json(review);
  } catch (error) {
    console.error('Error upvoting review:', error);
    res.status(500).json({ error: 'Failed to upvote review.' });
  }
});

/**
 * @route   DELETE /api/reviews/:review_id
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:review_id', requireAuth(), async (req, res) => {
  const { review_id } = req.params;
  const { userId } = req.auth;

  try {
    // Verify that the review exists
    const reviewResult = await pool.query(
      `SELECT * FROM reviews WHERE review_id = $1`,
      [review_id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const review = reviewResult.rows[0];

    // Check if the current user is the author
    if (review.user_id !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this review.' });
    }

    // Delete the review
    await pool.query(
      `DELETE FROM reviews WHERE review_id = $1`,
      [review_id]
    );

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

/**
 * @route   PUT /api/reviews/:review_id
 * @desc    Update a review
 * @access  Private
 */
router.put('/:review_id', requireAuth(), async (req, res) => {
  const { review_id } = req.params;
  const { review_text, stars } = req.body;
  const { userId } = req.auth;

  // Input validation
  if (!review_text && !stars) {
    return res.status(400).json({ error: 'At least one of review_text or stars must be provided.' });
  }

  if (stars && (stars < 1 || stars > 5)) {
    return res.status(400).json({ error: 'stars must be between 1 and 5.' });
  }

  try {
    // Verify that the review exists
    const reviewResult = await pool.query(
      `SELECT * FROM reviews WHERE review_id = $1`,
      [review_id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const review = reviewResult.rows[0];

    // Check if the current user is the author
    if (review.user_id !== userId) {
      return res.status(403).json({ error: 'You are not authorized to edit this review.' });
    }

    // Update the review
    const updatedReviewText = review_text || review.review_text;
    const updatedStars = stars || review.stars;

    const updateResult = await pool.query(
      `UPDATE reviews
       SET review_text = $1, stars = $2, date_updated = NOW()
       WHERE review_id = $3
       RETURNING *`,
      [updatedReviewText, updatedStars, review_id]
    );

    const updatedReview = updateResult.rows[0];

    // Fetch user data from Clerk
    try {
      const user = await clerkClient.users.getUser(userId);
      updatedReview.nickname = user.username || user.firstName || 'Anonymous';
      updatedReview.profile_image_url = user.profileImageUrl || '';
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      updatedReview.nickname = 'Anonymous';
      updatedReview.profile_image_url = '';
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review.' });
  }
});

module.exports = router;
