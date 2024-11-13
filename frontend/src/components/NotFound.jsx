// src/components/NotFound.jsx
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <Box sx={{ textAlign: 'center', mt: 8, px: 2 }}>
    <Typography variant="h1" component="div" gutterBottom>
      404
    </Typography>
    <Typography variant="h5" gutterBottom>
      Oops! Page Not Found
    </Typography>
    <Typography variant="body1" color="textSecondary">
      The page you're looking for doesn't exist or has been moved.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      component={Link}
      to="/"
      sx={{ mt: 4 }}
    >
      Go Back Home
    </Button>
  </Box>
);

export default NotFound;
