// src/components/CreateForm.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Container,
  Rating,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import MuiAlert from "@mui/material/Alert";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import BookProfile from "../components/BookProfile.jsx";
import { CircularProgress } from "@mui/material";

const CreateReviewISBN = () => {
  const location = useLocation();
  const { book } = location.state || {};
  const { getToken } = useAuth();
  const { isbn } = useParams();
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Destructure book properties with default values
  const {
    title = "",
    author = "",
    book_image = "",
    description = "",
    amazon_product_url = "",
    primary_isbn13 = "",
  } = book || {};

  const [newReview, setNewReview] = useState({
    stars: 5,
    review_text: "",
  });
  const [error, setError] = useState(null);

  /**
   * Validate the review form inputs
   */
  const validateReview = () => {
    const { stars, review_text } = newReview;
    if (stars < 1 || stars > 5) {
      setError("Star rating must be between 1 and 5.");
      return false;
    }
    if (!review_text.trim()) {
      setError("Review text cannot be empty.");
      return false;
    }
    if (review_text.length > 1000) {
      setError("Review text cannot exceed 1000 characters.");
      return false;
    }
    // Additional validations (e.g., prohibited content) can be added here
    return true;
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
   * Submit a new review.
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!validateReview()) {
      // Trigger error snackbar
      setSnackbarMessage(error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const { stars, review_text } = newReview;

    if (!review_text.trim()) {
      setError("Review text cannot be empty.");
      setSnackbarMessage("Review text cannot be empty.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setReviewSubmitting(true); // Disable the button
    setError(null);

    try {
      const token = await getToken();
      await axios.post(
        "http://localhost:3000/api/reviews",
        {
          book_isbn: isbn,
          review_text,
          stars,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Trigger success snackbar
      setSnackbarMessage("Review submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      // Redirect to the book details page after a short delay
      setTimeout(() => {
        navigate(`/book/${primary_isbn13}`, { state: { book } });
      }, 500);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review.");
      setSnackbarMessage("Failed to submit review.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setReviewSubmitting(false); // Re-enable the button
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ pb: 4 }}>
        <Grid container spacing={4}>
          <BookProfile
            book_image={book_image}
            title={title}
            author={author}
            description={description}
            amazon_product_url={amazon_product_url}
          />

          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmitReview} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ my: 2 }}>
                Leave a Review for Book {title}
              </Typography>
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
                    fullWidth
                    required
                    minRows={4}
                    maxRows={10}
                    error={
                      Boolean(error) && newReview.review_text.length > 1000
                    }
                    helperText={
                      newReview.review_text.length > 1000
                        ? "Review text cannot exceed 1000 characters."
                        : `${newReview.review_text.length}/1000`
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={reviewSubmitting}
                  >
                    {reviewSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </Grid>
              </Grid>
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Container>
    </>
  );
};

export default CreateReviewISBN;
