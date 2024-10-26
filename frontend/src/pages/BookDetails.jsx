// pages/BookDetails.jsx
import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Container, Typography,Box, Grid, Button } from '@mui/material';
import Navbar from '../components/Navbar.jsx';
import Reviews from '../components/Reviews.jsx'; 
import BookProfile from '../components/BookProfile';
import { useAuth } from '@clerk/clerk-react';

function BookDetails() {
  const location = useLocation();
  const { book } = location.state || {}; 
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  if (!book) {
    // Handle the case where no book data is available (e.g., direct URL access)
    return (
      <>
        <Navbar />
        <Container sx={{ py: 4 }}>
          <Typography variant="h6" color="error" align="center">
            No book data available. Please navigate from the home page.
          </Typography>
          <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="outlined" component={Link} to="/" color="primary">
              Back to Home
            </Button>
          </Grid>
        </Container>
      </>
    );
  }

  const { title, author, book_image, description, amazon_product_url, primary_isbn13 } = book;

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
            {/* Integrate the Reviews component */}
            <Typography sx={{ my: 2 }} variant="h5" gutterBottom>
              Reviews
            </Typography>

            {/* New Review Form */}
            {isSignedIn && (
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate(`/book/create/${primary_isbn13}`, { state: { book } })}>
                  Write a Review
                </Button>
              </Box>
            )}

            <Reviews bookIsbn={primary_isbn13} book={book} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default BookDetails;
