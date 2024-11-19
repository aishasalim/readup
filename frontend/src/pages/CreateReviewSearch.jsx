// src/components/CreateReviewSearch.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Rating,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Container,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import BookProfile from "../components/BookProfile.jsx";
import MuiAlert from "@mui/material/Alert";

const CreateReviewSearch = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const currentUserId = user?.id;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // State for search parameters
  const [searchParams, setSearchParams] = useState({
    author: "",
    title: "",
    isbn: "",
  });

  // State for search results
  const [searchResults, setSearchResults] = useState([]);

  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for selected book to review
  const [selectedBook, setSelectedBook] = useState(null);

  // State for review form
  const [newReview, setNewReview] = useState({
    stars: 5,
    review_text: "",
  });
  const [reviewError, setReviewError] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  /**
   * Validate ISBN format (ISBN-10 or ISBN-13)
   */
  const isValidISBN = (isbn) => {
    // Remove any hyphens
    const cleanedISBN = isbn.replace(/-/g, "");
    // Check for ISBN-10
    if (/^\d{9}[\dX]$/.test(cleanedISBN)) {
      return true;
    }
    // Check for ISBN-13
    if (/^\d{13}$/.test(cleanedISBN)) {
      return true;
    }
    return false;
  };

  /**
   * Handle changes in the search input fields.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  /**
   * Handle the search form submission.
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    const { author, title, isbn } = searchParams;

    // Validate that at least one search parameter is provided
    if (!author.trim() && !title.trim() && !isbn.trim()) {
      setError("Please enter at least one search criterion.");
      return;
    }

    // If ISBN is provided, validate its format
    if (isbn.trim() && !isValidISBN(isbn.trim())) {
      setError("Please enter a valid ISBN-10 or ISBN-13.");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedBook(null);
    setSearchResults([]);

    try {
      const params = {};

      if (author.trim()) params.author = author.trim();
      if (title.trim()) params.title = title.trim();
      if (isbn.trim()) params.isbn = isbn.trim();

      const response = await axios.get(
        "http://localhost:3000/api/books/search",
        {
          params,
        }
      );

      // Assuming the API returns a list of books
      const books = response.data.results.lists.flatMap((list) => list.books);
      setSearchResults(books);

      if (books.length === 0) {
        setError("No books found matching your search criteria.");
      }
    } catch (error) {
      console.error("Error searching books:", error);
      setError("Failed to search books.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle selecting a book to review.
   */
  const handleSelectBook = (book) => {
    setSelectedBook(book);
    // Scroll to the review form
    setTimeout(() => {
      const reviewForm = document.getElementById("review-form");
      if (reviewForm) {
        reviewForm.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  /**
   * Handle changes in the review form.
   */
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle changes in the star rating.
   */
  const handleReviewStarChange = (event, newValue) => {
    setNewReview((prev) => ({
      ...prev,
      stars: newValue,
    }));
  };

  /**
   * Submit the new review.
   */
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const { stars, review_text } = newReview;

    if (!review_text.trim()) {
      setReviewError("Review text cannot be empty.");
      // Trigger error snackbar
      setSnackbarMessage("Review text cannot be empty.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      const token = await getToken();

      await axios.post(
        "http://localhost:3000/api/reviews",
        {
          book_isbn: selectedBook.primary_isbn13, // Use the book's ISBN
          review_text,
          stars,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset the form
      setNewReview({ stars: 5, review_text: "" });
      // Trigger success snackbar
      setSnackbarMessage("Review submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      // Redirect to the book details page
      setTimeout(() => {
        navigate(`http://localhost:3000/book/${selectedBook.primary_isbn13}`, {
          state: { book: selectedBook },
        });
      }, 500);
    } catch (err) {
      console.error("Error submitting review:", err);
      // Trigger error snackbar
      setSnackbarMessage("Failed to submit review.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setReviewError("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        {/* Search Form */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            borderRadius: 2,
            mb: 4,
            p: 3,
            boxShadow: 3,
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Search for a Book to Review
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Author"
                name="author"
                value={searchParams.author}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Title"
                name="title"
                value={searchParams.title}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="ISBN"
                name="isbn"
                value={searchParams.isbn}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Search"
                )}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => {
                  setSearchParams({ author: "", title: "", isbn: "" });
                  setSearchResults([]);
                  setSelectedBook(null);
                  setError(null);
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Search Results:
            </Typography>
            <Grid container spacing={2}>
              {searchResults.map((book) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={book.primary_isbn13 || book.title + book.author}
                >
                  <Card>
                    <CardHeader
                      avatar={
                        book.book_image ? (
                          <Avatar src={book.book_image} alt={book.title} />
                        ) : (
                          <Avatar>{book.title.charAt(0).toUpperCase()}</Avatar>
                        )
                      }
                      title={book.title}
                      subheader={`By ${book.author}`}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {book.description.substring(0, 100)}...
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => handleSelectBook(book)}
                      >
                        Write a Review
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Review Form */}
        {selectedBook && (
          <Box
            id="review-form"
            component="form"
            onSubmit={handleSubmitReview}
            sx={{
              borderRadius: 2,
              p: 3,
              boxShadow: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>
              Leave a Review for "{selectedBook.title}"
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <BookProfile
                  book_image={selectedBook.book_image}
                  title={selectedBook.title}
                  author={selectedBook.author}
                  description={selectedBook.description}
                  amazon_product_url={selectedBook.amazon_product_url}
                />
              </Grid>
              <Grid item xs={12}>
                <Rating
                  name="stars"
                  value={newReview.stars}
                  onChange={handleReviewStarChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Your Review"
                  name="review_text"
                  value={newReview.review_text}
                  onChange={handleReviewChange}
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
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </Grid>
              {reviewError && (
                <Grid item xs={12}>
                  <Alert severity="error">{reviewError}</Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
        {/* Snackbar for notifications */}
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

export default CreateReviewSearch;
