// index.js
require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const morgan = require('morgan'); // Optional: For logging

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Optional: Logging

// Initialize Clerk middleware
app.use(clerkMiddleware());

// Import the PostgreSQL pool
const pool = require('./db'); // Ensure the path is correct

// Routes
const booksRouter = require('./routes/books'); // Ensure this file exists and is correctly set up
const reviewsRouter = require('./routes/reviews');
const listsRouter = require('./routes/lists');

app.use('/api/books', booksRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/lists', listsRouter);

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Book API');
});

// Handle 404 - Not Found
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the pool for use in other modules if needed
module.exports = pool;
