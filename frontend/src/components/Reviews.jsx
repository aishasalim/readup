// src/components/Reviews.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Grid,
  CircularProgress,
  Box,
  Avatar,
  Button,
  TextField,
  Rating,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom'; 

const Reviews = ({ bookIsbn }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for new review form
  const [newReview, setNewReview] = useState({
    stars: 5,
    review_text: '',
  });

  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const currentUserId = user?.id;

  // State for managing the menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookIsbn]);

  /**
   * Fetch reviews for the specified book ISBN.
   */
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/reviews/${bookIsbn}`);
      console.log('Fetched reviews:', response.data);
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input changes in the review form.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle changes in the star rating.
   */
  const handleStarChange = (event, newValue) => {
    setNewReview((prev) => ({
      ...prev,
      stars: newValue,
    }));
  };

  /**
   * Handle opening the menu for a specific review.
   * @param {Event} event - The click event.
   * @param {string} reviewId - The ID of the review.
   */
  const handleMenuOpen = (event, reviewId) => {
    setAnchorEl(event.currentTarget);
    setSelectedReviewId(reviewId);
  };

  /**
   * Handle closing the menu.
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReviewId(null);
  };

  /**
   * Handle the Edit action.
   * @param {string} reviewId - The ID of the review to edit.
   */
  const handleEdit = (reviewId) => {
    // Implement edit functionality here
    console.log(`Edit review with ID: ${reviewId}`);
    // Example: Navigate to an edit page
    navigate(`/isbn/${bookIsbn}/reviews/${reviewId}/edit`);
    handleMenuClose();
  };

  /**
   * Handle the Delete action.
   * @param {string} reviewId - The ID of the review to delete.
   */
  const handleDelete = (reviewId) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  /**
   * Confirm deletion of the review.
   */
  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      const token = await getToken();
      await axios.delete(`http://localhost:3000/api/reviews/${reviewToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the deleted review from the state
      setReviews((prevReviews) => prevReviews.filter((rev) => rev.review_id !== reviewToDelete));
      setError(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review.');
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  /**
   * Cancel deletion of the review.
   */
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  /**
   * Submit a new review.
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
  
    const { stars, review_text } = newReview;
  
    if (!review_text.trim()) {
      setError('Review text cannot be empty.');
      return;
    }
  
    try {
      const token = await getToken(); // Removed { template: 'codehooks' }
  
      const response = await axios.post(
        'http://localhost:3000/api/reviews', 
        {
          book_isbn: bookIsbn,
          review_text,
          stars,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Add the new review to the list
      setReviews((prevReviews) => [response.data, ...prevReviews]);
      setNewReview({ stars: 5, review_text: '' });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review.');
    }
  };

  /**
   * Upvote a review.
   */
  const handleUpvote = async (reviewId) => {
    try {
      const token = await getToken(); // Removed { template: 'codehooks' }
  
      const response = await axios.post(
        `http://localhost:3000/api/reviews/${reviewId}/upvote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Update the upvotes in the local state
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.review_id === reviewId ? { ...review, upvotes: response.data.upvotes } : review
        )
      );
    } catch (err) {
      console.error('Error upvoting review:', err);
      setError('Failed to upvote review.');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>

      <Typography variant="h5" gutterBottom>
        Reviews
      </Typography>

      {/* New Review Form */}
      {isSignedIn && (
        <Box component="form" onSubmit={handleSubmitReview} sx={{ mb: 4 }}>
          <Typography variant="h6">Leave a Review</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Rating
                name="stars"
                value={newReview.stars}
                onChange={handleStarChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Your Review"
                name="review_text"
                value={newReview.review_text}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Submit Review
              </Button>
            </Grid>
          </Grid>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      )}

      {/* Reviews List */}
      {loading ? (
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '20vh' }}>
          <CircularProgress />
        </Grid>
      ) : error ? (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      ) : reviews.length > 0 ? (
        <Grid container spacing={2}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.review_id}>
              <Card>
                <CardHeader
                  avatar={
                    review.profile_image_url ? (
                      <Avatar src={review.profile_image_url} />
                    ) : (
                      <Avatar>{(review.nickname || 'A').charAt(0).toUpperCase()}</Avatar>
                    )
                  }
                  action={
                    // Three-Dot Menu IconButton
                    <IconButton
                      aria-label="more"
                      aria-controls={`menu-${review.review_id}`}
                      aria-haspopup="true"
                      onClick={(event) => handleMenuOpen(event, review.review_id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={review.nickname || 'Anonymous'}
                  subheader={new Date(review.date_created).toLocaleString()}
                />
                <CardContent>
                  <Rating value={review.stars} readOnly />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {review.review_text}
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleUpvote(review.review_id)}
                  >
                    Upvote ({review.upvotes})
                  </Button>
                </Box>

                {/* Menu Component */}
                <Menu
                  id={`menu-${review.review_id}`}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedReviewId === review.review_id}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {/* Conditionally render Edit and Delete if the review belongs to the current user */}
                  {review.user_id === currentUserId && [
                    <MenuItem key="edit" onClick={() => handleEdit(review.review_id)}>Edit</MenuItem>,
                    <MenuItem key="delete" onClick={() => handleDelete(review.review_id)}>Delete</MenuItem>,
                  ]}
                </Menu>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">No reviews yet. Be the first to review!</Typography>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Delete Review"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Reviews;
