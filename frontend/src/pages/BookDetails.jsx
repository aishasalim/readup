// pages/BookDetails.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import Navbar from '../components/Navbar.jsx';
import Reviews from '../components/Reviews.jsx'; // Import the Reviews component

function BookDetails() {
  const location = useLocation();
  const { book } = location.state || {}; // Destructure book from state

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
        {/* Modify the Grid container to align the button to the left */}
        <Grid container justifyContent="flex-start" sx={{ my: 2 }}>
          <Button variant="outlined" component={Link} to="/" color="primary">
            Back to Home
          </Button>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              {book_image && (
                <CardMedia
                  component="img"
                  height="500"
                  image={book_image}
                  alt={title}
                />
              )}
              <CardContent>
                <Typography variant="h5" component="div">
                  {title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  By {author}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {description}
                </Typography>
                {amazon_product_url && (
                  <Button
                    variant="contained"
                    color="primary"
                    href={amazon_product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                  >
                    Buy on Amazon
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            {/* Integrate the Reviews component */}
            <Reviews bookIsbn={primary_isbn13} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default BookDetails;
