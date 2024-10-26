// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Rating,
} from '@mui/material';
import { useUser } from '@clerk/clerk-react';
import Navbar from '../components/Navbar.jsx';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]); // Combined reviews with book data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Helper function to fetch book data using Google Books API
  const fetchBookData = async (isbn) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      if (
        response.data.totalItems > 0 &&
        response.data.items &&
        response.data.items.length > 0
      ) {
        const bookInfo = response.data.items[0].volumeInfo;
        return {
          title: bookInfo.title || 'No Title',
          author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author',
          book_image: bookInfo.imageLinks
            ? bookInfo.imageLinks.thumbnail
            : '',
          description: bookInfo.description || 'No Description Available.',
          amazon_product_url: bookInfo.infoLink || '',
          primary_isbn13: isbn,
        };
      } else {
        return {
          title: 'No Title',
          author: 'Unknown Author',
          book_image: '',
          description: 'No Description Available.',
          amazon_product_url: '',
          primary_isbn13: isbn,
        };
      }
    } catch (err) {
      console.error(`Error fetching book data for ISBN ${isbn}:`, err);
      return {
        title: 'No Title',
        author: 'Unknown Author',
        book_image: '',
        description: 'No Description Available.',
        amazon_product_url: '',
        primary_isbn13: isbn,
      };
    }
  };

  useEffect(() => {
    // Fetch user reviews when component mounts
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/reviews/user/${user.id}`
        );
        setReviews(response.data);
        setError(null);

        // Fetch book data for each review
        const reviewsWithBookData = await Promise.all(
          response.data.map(async (review) => {
            const book = await fetchBookData(review.book_isbn);
            return { ...review, book };
          })
        );

        setUserReviews(reviewsWithBookData);
      } catch (err) {
        console.error('Error fetching reviews:', err); // Log the error to understand it better
        setError('Failed to fetch reviews.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchReviews();
    }
  }, [user]);

  // Handler for navigating to the book detail page
  const handleCardClick = (book) => {
    navigate(`/book/${book.primary_isbn13}`, { state: { book } });
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 2 }}>
        {/* Tabs for Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Your Reviews" />
            <Tab label="Your Reading Lists" />
          </Tabs>
        </Box>

        {/* Reviews Tab */}
        {tabValue === 0 && (
          <Box >
            <Box sx={{ maxHeight: '79vh', overflowY: 'auto', pr: 2 }}>
              {loading ? (
                <CircularProgress />
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : userReviews.length === 0 ? (
                <Typography variant="body1">You have no reviews yet.</Typography>
              ) : (
                userReviews.map((review) => (
                  <Card
                    key={review.review_id}
                    sx={{ mb: 2, cursor: 'pointer' }}
                    onClick={() => handleCardClick(review.book)}
                  >
                    <CardHeader
                      avatar={
                        <Avatar src={review.profile_image_url} alt={review.nickname} />
                      }
                      title={review.nickname}
                      subheader={`Reviewed ISBN: ${review.book_isbn}`}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {review.book.book_image && (
                          <Avatar
                            variant="square"
                            src={review.book.book_image}
                            alt={review.book.title}
                            sx={{ width: 56, height: 84, mr: 2 }}
                          />
                        )}
                        <Typography variant="h6">{review.book.title}</Typography>
                      </Box>
                      <Rating value={review.stars} readOnly />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {review.review_text}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        )}

        {/* Reading Lists Tab */}
        {tabValue === 1 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom>
              Your Reading Lists
            </Typography>
            <Box sx={{ maxHeight: '37em', overflowY: 'auto', pr: 2 }}>
              {/* Your Reading Lists content goes here */}
              <Typography variant="body1">Reading Lists functionality is coming soon!</Typography>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
