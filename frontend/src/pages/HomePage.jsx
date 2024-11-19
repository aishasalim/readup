// frontend/src/pages/HomePage.jsx

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { fetchBooksFeed, searchBooks } from "../api/books";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useAuth } from "@clerk/clerk-react";
import {
  Grid,
  Container,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";

function HomePage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // State for search parameters
  const [searchParams, setSearchParams] = useState({
    author: "",
    title: "",
    isbn: "",
  });

  // State to determine if currently viewing search results
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Fetch books from the backend API when the component mounts
    fetchBooksFeedHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetches the bestsellers feed from the NYT Books API.
   */
  const fetchBooksFeedHandler = async () => {
    setLoading(true);
    setError(null);
    setIsSearching(false);
    try {
      const token = await getToken(); // Obtain the token
      const data = await fetchBooksFeed(token); // Pass the token
      const allBooks =
        data?.results?.lists?.flatMap((list) => list.books) || [];
      setBooks(allBooks);
    } catch (error) {
      console.error("Error fetching books feed:", error);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles changes in the search input fields.
   * @param {Object} e - The event object.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  /**
   * Handles the search form submission.
   * Makes an API request to the search endpoint with the provided search parameters.
   * @param {Object} e - The event object.
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    const { author, title, isbn } = searchParams;

    if (!author.trim() && !title.trim() && !isbn.trim()) {
      setError("Please enter at least one search criterion.");
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);
    try {
      const params = {};

      if (author.trim()) params.author = author.trim();
      if (title.trim()) params.title = title.trim();
      if (isbn.trim()) params.isbn = isbn.trim();

      const token = await getToken(); // Obtain the token
      const data = await searchBooks(params, token); // Pass the token
      const searchResults =
        data?.results?.lists?.flatMap((list) => list.books) || [];
      setBooks(searchResults);
    } catch (error) {
      console.error("Error searching books:", error);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles resetting the search and viewing the bestsellers feed.
   */
  const handleResetSearch = () => {
    setSearchParams({ author: "", title: "", isbn: "" });
    fetchBooksFeedHandler();
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
          }}
        >
          <Typography variant="h6" gutterBottom>
            Search Books
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
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Search
              </Button>
            </Grid>
            {isSearching && (
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={handleResetSearch}
                >
                  Reset
                </Button>
              </Grid>
            )}
          </Grid>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {/* Content Area */}
        {loading ? (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: "50vh" }}
          >
            <CircularProgress size={60} color="primary" />
          </Grid>
        ) : error && !isSearching ? (
          <Typography variant="h6" color="error" align="center">
            {error}
          </Typography>
        ) : books.length > 0 ? (
          <Grid container spacing={4}>
            {books.map((book, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="h6" align="center">
            No books found.
          </Typography>
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 4,
          py: 2,
          backgroundColor: "background.paper",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="textSecondary">
          Developed by Aisha Salimgereyeva, Sahrish Afzal, Maryam Nisar
        </Typography>
        <IconButton
          component="a"
          href="https://github.com/aishasalim/readup"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          sx={{ color: "text.secondary" }}
        >
          <GitHubIcon />
        </IconButton>
      </Box>
    </>
  );
}

export default HomePage;
