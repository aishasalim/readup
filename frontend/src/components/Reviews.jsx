// frontend/src/components/Reviews.jsx

import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  CircularProgress,
  Box,
  Avatar,
  Button,
  Rating,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  Snackbar,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert as MuiAlert,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { fetchReviewsByISBN, deleteReview, toggleUpvote } from "../api/reviews";

const Reviews = ({ bookIsbn, book }) => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const currentUserId = user?.id;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for managing the menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
      const data = await fetchReviewsByISBN(bookIsbn);
      console.log("Fetched reviews:", data);
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle opening the menu for a specific review.
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
   */
  const handleEdit = (reviewId) => {
    console.log(`Edit review with ID: ${reviewId}`);
    navigate(`/${bookIsbn}/reviews/${reviewId}/edit`, {
      state: { book },
    });
    handleMenuClose();
  };

  /**
   * Handle the Delete action.
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
      await deleteReview(reviewToDelete, token);
      // Remove the deleted review from the state
      setReviews((prevReviews) =>
        prevReviews.filter((rev) => rev.review_id !== reviewToDelete)
      );
      setSnackbar({
        open: true,
        message: "Review deleted successfully.",
        severity: "success",
      });
      setError(null);
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review.");
      setSnackbar({
        open: true,
        message: "Failed to delete review.",
        severity: "error",
      });
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
   * Toggle upvote for a review.
   */
  const handleUpvote = async (reviewId, userUpvoted) => {
    try {
      const data = await toggleUpvote(reviewId, getToken);
      // Assuming the response contains the updated upvotes and upvote status
      const { upvotes, userUpvoted: updatedUserUpvoted } = data;

      // Update the upvotes and userUpvoted status in the local state
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.review_id === reviewId
            ? {
                ...review,
                upvotes: upvotes,
                userUpvoted: updatedUserUpvoted,
              }
            : review
        )
      );

      // Show snackbar notification
      if (updatedUserUpvoted) {
        setSnackbar({
          open: true,
          message: "Upvoted successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Upvote removed.",
          severity: "info",
        });
      }
    } catch (err) {
      console.error("Error toggling upvote:", err);
      setSnackbar({
        open: true,
        message: "Failed to toggle upvote.",
        severity: "error",
      });
    }
  };

  /**
   * Handle closing the Snackbar.
   */
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
      {/* Reviews List */}
      {loading ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: "20vh" }}
        >
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
                      <Avatar>
                        {(review.nickname || "A").charAt(0).toUpperCase()}
                      </Avatar>
                    )
                  }
                  action={
                    review.user_id === currentUserId && user ? (
                      <IconButton
                        aria-label="more"
                        aria-controls={`menu-${review.review_id}`}
                        aria-haspopup="true"
                        onClick={(event) =>
                          handleMenuOpen(event, review.review_id)
                        }
                      >
                        <MoreVertIcon />
                      </IconButton>
                    ) : null
                  }
                  title={review.nickname || "Anonymous"}
                  subheader={new Date(review.date_created).toLocaleString()}
                />

                <CardContent>
                  <Rating value={review.stars} readOnly />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {review.review_text}
                  </Typography>
                </CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", pb: 2, pl: 2 }}
                >
                  <Button
                    size="small"
                    variant={review.userUpvoted ? "contained" : "outlined"}
                    color={review.userUpvoted ? "primary" : "default"}
                    onClick={() =>
                      handleUpvote(review.review_id, review.userUpvoted)
                    }
                    disabled={!user} // Disable if not authenticated
                    startIcon={
                      review.userUpvoted ? (
                        <ThumbUpIcon />
                      ) : (
                        <ThumbUpOffAltIcon />
                      )
                    }
                  >
                    {review.userUpvoted ? "Remove Upvote" : "Upvote"} (
                    {review.upvotes})
                  </Button>
                </Box>

                {/* Menu Component */}
                {review.user_id === currentUserId && (
                  <Menu
                    id={`menu-${review.review_id}`}
                    anchorEl={anchorEl}
                    open={
                      Boolean(anchorEl) && selectedReviewId === review.review_id
                    }
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem
                      key="edit"
                      onClick={() => handleEdit(review.review_id)}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      key="delete"
                      onClick={() => handleDelete(review.review_id)}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">
          No reviews yet. Be the first to review!
        </Typography>
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
            Are you sure you want to delete this review? This action cannot be
            undone.
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Reviews;
