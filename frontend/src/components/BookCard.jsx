// components/BookCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
} from '@mui/material';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  const { title, author, book_image, description, primary_isbn13, amazon_product_url } = book;

  return (
    <Card
      sx={{
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 3,
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      {book_image && (
        <CardMedia
          component="img"
          height="200"
          image={book_image}
          alt={title}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {title}
        </Typography>
        {author && (
          <Typography variant="body2" color="text.secondary">
            By {author}
          </Typography>
        )}
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {description.substring(0, 100)}...
          </Typography>
        )}
      </CardContent>
      <CardActions>
        {amazon_product_url && (
          <Button
            size="small"
            color="primary"
            href={amazon_product_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy on Amazon
          </Button>
        )}
        {/* Pass the entire book object via state */}
        <Button
          size="small"
          color="secondary"
          component={Link}
          to={`/book/${encodeURIComponent(primary_isbn13)}`}
          state={{ book }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default BookCard;

