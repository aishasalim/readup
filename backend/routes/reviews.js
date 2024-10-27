// routes/reviews.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { clerkClient } = require('@clerk/express');
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
      const user = await clerkClient.users.getUser(userId);
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
 * @route   GET /api/reviews/user/:user_id
 * @desc    Get all reviews by a specific user
 * @access  Public
 */
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM reviews
       WHERE user_id = $1
       ORDER BY date_created DESC`,
      [user_id]
    );

    const reviews = await Promise.all(
      result.rows.map(async (review) => {
        try {
          const user = await clerkClient.users.getUser(review.user_id);
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
    console.error('Error fetching reviews for user:', error);
    res.status(500).json({ error: 'Failed to fetch reviews for this user.' });
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
          const user = await clerkClient.users.getUser(review.user_id);
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
 * @desc    Toggle upvote for a review
 * @access  Private
 */
router.post('/:review_id/upvote', requireAuth(), async (req, res) => {
  const { review_id } = req.params;
  const { userId } = req.auth;

  console.log(`Upvote toggle request by user: ${userId} for review: ${review_id}`);

  try {
    // Check if the review exists
    const reviewCheck = await pool.query(
      `SELECT * FROM reviews WHERE review_id = $1`,
      [review_id]
    );

    if (reviewCheck.rows.length === 0) {
      console.log(`Review not found: ${review_id}`);
      return res.status(404).json({ error: 'Review not found.' });
    }

    // Check if the user has already upvoted this review
    const upvoteCheck = await pool.query(
      `SELECT * FROM upvotes WHERE review_id = $1 AND user_id = $2`,
      [review_id, userId]
    );

    let action;
    let updatedUpvotes;

    if (upvoteCheck.rows.length > 0) {
      // User has already upvoted; remove the upvote
      await pool.query(
        `DELETE FROM upvotes WHERE review_id = $1 AND user_id = $2`,
        [review_id, userId]
      );

      // Decrement the upvotes count
      const updateResult = await pool.query(
        `UPDATE reviews
         SET upvotes = upvotes - 1
         WHERE review_id = $1
         RETURNING upvotes`,
        [review_id]
      );

      updatedUpvotes = updateResult.rows[0].upvotes;
      action = 'removed';
      console.log(`User ${userId} removed upvote from review ${review_id}`);
    } else {
      // User has not upvoted; add the upvote
      await pool.query(
        `INSERT INTO upvotes (review_id, user_id)
         VALUES ($1, $2)`,
        [review_id, userId]
      );

      // Increment the upvotes count
      const updateResult = await pool.query(
        `UPDATE reviews
         SET upvotes = upvotes + 1
         WHERE review_id = $1
         RETURNING upvotes`,
        [review_id]
      );

      updatedUpvotes = updateResult.rows[0].upvotes;
      action = 'added';
      console.log(`User ${userId} added upvote to review ${review_id}`);
    }

    // Respond with the updated upvotes and action
    res.json({
      review_id: review_id,
      upvotes: updatedUpvotes,
      action, // 'added' or 'removed'
    });
  } catch (error) {
    console.error('Error toggling upvote:', error);
    res.status(500).json({ error: 'Failed to toggle upvote.' });
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
 * @route   GET /api/reviews/review/:review_id
 * @desc    Get a specific review by review_id
 * @access  Public
 */
router.get('/review/:review_id', async (req, res) => {
  const { review_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM reviews WHERE review_id = $1`,
      [review_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const review = result.rows[0];

    // Fetch user data from Clerk
    try {
      const user = await clerkClient.users.getUser(review.user_id);
      review.nickname = user.username || user.firstName || 'Anonymous';
      review.profile_image_url = user.profileImageUrl || '';
    } catch (err) {
      console.error(`Error fetching user ${review.user_id}:`, err);
      review.nickname = 'Anonymous';
      review.profile_image_url = '';
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review.' });
  }
});

/**
 * @route   PUT /api/reviews/:review_id
 * @desc    Update an existing review
 * @access  Private
 */
router.put('/review/:review_id', requireAuth(), async (req, res) => {
  const { review_id } = req.params;
  const { userId } = req.auth;
  const { stars, review_text } = req.body;

  if (!stars || !review_text) {
    return res.status(400).json({ error: 'Stars and review text are required.' });
  }

  try {
    // Check if the review exists and belongs to the current user
    const reviewCheck = await pool.query(
      `SELECT * FROM reviews WHERE review_id = $1`,
      [review_id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const review = reviewCheck.rows[0];

    if (review.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this review.' });
    }

    // Update the review
    const updatedReview = await pool.query(
      `UPDATE reviews
       SET stars = $1,
           review_text = $2,
           date_modified = NOW()
       WHERE review_id = $3
       RETURNING *`,
      [stars, review_text, review_id]
    );

    res.json(updatedReview.rows[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review.' });
  }
});



module.exports = router;
