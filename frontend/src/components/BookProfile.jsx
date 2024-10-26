import React from 'react';
import { Grid, Button, Card, CardMedia, CardContent, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const BookProfile = ({ book_image, title, author, description, amazon_product_url }) => {
  return (
    <Grid item xs={12} md={4}>
      <Button sx={{ my: 2 }} variant="outlined" component={Link} to="/" color="primary">
        Back to Home
      </Button>
      <Card>
        {book_image && (
          <CardMedia
            component="img"
            height="400"
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
  );
};

export default BookProfile;
