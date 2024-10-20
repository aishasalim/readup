// index.js
require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Routes
const booksRouter = require('./routes/books');
app.use('/api/books', booksRouter);

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Book API');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
