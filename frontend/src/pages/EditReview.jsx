// src/pages/EditReview.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Container,
  Rating,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import BookProfile from "../components/BookProfile.jsx";

const EditReview = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success', 'error', 'warning', 'info'

  const location = useLocation();
  const { book } = location.state || {};
  const { getToken } = useAuth();
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const {
    title = "",
    author = "",
    book_image = "",
    description = "",
    amazon_product_url = "",
    primary_isbn13 = "",
  } = book || {};

  const [reviewData, setReviewData] = useState({
    stars: 5,
    review_text: "",
  });
  const [bookData, setBookData] = useState(book || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchReviewData();
  }, [reviewId]);

  const fetchReviewData = async () => {
    setLoading(true); // Start loading indicator
    try {
      const token = await getToken();
      const response = await axios.get(
        `http://localhost:3000/api/reviews/review/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const review = response.data;

      setReviewData({
        stars: review.stars,
        review_text: review.review_text,
      });
    } catch (err) {
      console.error("Error fetching review:", err);
      setError(err.response?.data?.error || "Failed to load review.");
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  /**
   * Handle input changes in the review form.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle changes in the star rating.
   */
  const handleStarChange = (event, newValue) => {
    setReviewData((prev) => ({
      ...prev,
      stars: newValue,
    }));
  };

  /**
   * Submit the updated review.
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const { stars, review_text } = reviewData;

    if (!review_text.trim()) {
      setError("Review text cannot be empty.");
      // Trigger error snackbar
      setSnackbarMessage("Review text cannot be empty.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setSubmitLoading(true);
      const token = await getToken();
      await axios.put(
        `http://localhost:3000/api/reviews/review/${reviewId}`,
        {
          stars,
          review_text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Redirect to the book details page after successful update
      // Wait before navigating
      setTimeout(() => {
        navigate(`/book/${primary_isbn13}`, { state: { book: bookData } });
      }, 500);
      // Trigger success snackbar
      setSnackbarMessage("Review updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error updating review:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        // Trigger error snackbar with backend message
        setSnackbarMessage(err.response.data.error);
      } else {
        setError("Failed to update review.");
        // Trigger error snackbar with generic message
        setSnackbarMessage("Failed to update review.");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSubmitLoading(false);
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
            {loading ? (
              // Display loading spinner when data is still fetching
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress />
              </Box>
            ) : (
              <Box
                component="form"
                onSubmit={handleSubmitReview}
                sx={{ mb: 4 }}
              >
                <Typography variant="h5" sx={{ my: 2 }}>
                  Edit Your Review for "{title}"
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Rating
                      name="stars"
                      value={reviewData.stars}
                      onChange={handleStarChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Your Review"
                      name="review_text"
                      value={reviewData.review_text}
                      onChange={handleInputChange}
                      multiline
                      fullWidth
                      required
                      minRows={4}
                      maxRows={10}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitLoading}
                    >
                      {submitLoading ? "Updating..." : "Update Review"}
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
          </Grid>
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default EditReview;
