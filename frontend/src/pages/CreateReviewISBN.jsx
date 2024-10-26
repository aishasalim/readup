// src/components/CreateForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Container,
  Rating,
  Alert,
} from '@mui/material';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BookProfile from '../components/BookProfile.jsx';

const CreateReviewISBN = () => {
  const location = useLocation();
  const { book } = location.state || {}; 
  const { getToken } = useAuth();
  const { isbn } = useParams();
  const navigate = useNavigate();

  // Destructure book properties with default values
  const { title = '', author = '', book_image = '', description = '', amazon_product_url = '', primary_isbn13 = '' } = book || {};

  const [newReview, setNewReview] = useState({
    stars: 5,
    review_text: '',
  });
  const [error, setError] = useState(null);

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
  
    const { stars, review_text } = newReview;
  
    if (!review_text.trim()) {
      setError('Review text cannot be empty.');
      return;
    }
  
    try {
      const token = await getToken();
      await axios.post(
        'http://localhost:3000/api/reviews',
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
      // Redirect to the book details page after successful submission
      navigate(`/book/${primary_isbn13}`, { state: { book } });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review.');
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
            amazon_product_url={amazon_product_url} />
      

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
                    minRows={4}  // Reduced from 10 to 4
                    maxRows={10}  // Reduced from 20 to 10
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
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default CreateReviewISBN;
