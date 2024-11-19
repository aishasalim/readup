// frontend/src/pages/BookDetails.jsx

import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  TextField,
  Snackbar, // Import Snackbar
  Alert as MuiAlert, // Import Alert
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import Reviews from "../components/Reviews.jsx";
import BookProfile from "../components/BookProfile";
import { useAuth } from "@clerk/clerk-react";
import { fetchBookByISBN } from "../api/books"; // Import fetchBookByISBN

function BookDetails() {
  const { isbn } = useParams();
  const location = useLocation();
  const { book } = location.state || {};
  const { isSignedIn, getToken } = useAuth();
  const navigate = useNavigate();

  // State variables for the "Add to List" dialog
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [error, setError] = useState(null);

  // State variables for creating a new list
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingListError, setCreatingListError] = useState(null);
  const [creatingListLoading, setCreatingListLoading] = useState(false);

  // State variables for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success', 'error', 'warning', 'info'

  // State for book details
  const [bookData, setBookData] = useState(book || null);
  const [loadingBook, setLoadingBook] = useState(!book);
  const [bookError, setBookError] = useState(null);

  useEffect(() => {
    if (!bookData) {
      fetchBookDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isbn]);

  /**
   * Fetch book details if not passed via location.state
   */
  const fetchBookDetails = async () => {
    setLoadingBook(true);
    try {
      const fetchedBook = await fetchBookByISBN(isbn);
      if (fetchedBook) {
        setBookData(fetchedBook);
      } else {
        setBookError("Book not found.");
      }
    } catch (err) {
      console.error("Error fetching book details:", err);
      setBookError("Failed to load book details.");
    } finally {
      setLoadingBook(false);
    }
  };

  // Handler to close the Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Function to show the Snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddToList = async (listId) => {
    try {
      const token = await getToken();

      const bookDataLocal = bookData; // Ensure 'bookData' is used

      await axios.post(
        `http://localhost:3000/api/lists/${listId}/items`,
        { book: bookDataLocal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar(`Book added to the list!`, "success");
    } catch (err) {
      console.error("Error adding book to list:", err);
      if (err.response && err.response.status === 409) {
        showSnackbar("The book is already in the list.", "warning");
      } else {
        showSnackbar("Failed to add book to list.", "error");
      }
    }
  };

  const handleClickOpen = async () => {
    if (!isSignedIn) {
      showSnackbar("Please sign in to add books to your lists.", "warning");
      navigate("/sign-in");
      return;
    }
    try {
      setOpen(true);
      setLoadingLists(true);
      const token = await getToken();

      const response = await axios.get("http://localhost:3000/api/lists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLists(response.data);
      setLoadingLists(false);
    } catch (err) {
      console.error("Error fetching lists:", err);
      setError("Failed to load lists.");
      setLoadingLists(false);
      showSnackbar("Failed to load lists.", "error");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatingList(false);
    setNewListName("");
    setCreatingListError(null);
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName) {
      setCreatingListError("List name cannot be empty.");
      return;
    }
    try {
      setCreatingListLoading(true);
      const token = await getToken();
      const response = await axios.post(
        "http://localhost:3000/api/lists",
        { name: newListName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Add the new list to the lists
      setLists([...lists, response.data]);
      setCreatingList(false);
      setNewListName("");
      setCreatingListError(null);
      setCreatingListLoading(false);
      showSnackbar(
        `List "${response.data.name}" created successfully!`,
        "success"
      );
    } catch (err) {
      console.error("Error creating list:", err);
      setCreatingListError("Failed to create list.");
      setCreatingListLoading(false);
      showSnackbar("Failed to create list.", "error");
    }
  };

  if (loadingBook) {
    return (
      <>
        <Navbar />
        <Container>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="80vh"
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (bookError) {
    return (
      <>
        <Navbar />
        <Container>
          <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
            {bookError}
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

  const {
    title,
    author,
    book_image,
    description,
    amazon_product_url,
    primary_isbn13,
  } = bookData;

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
            amazon_product_url={amazon_product_url}
          />

          <Grid item xs={12} md={8}>
            <Typography sx={{ my: 2 }} variant="h5" gutterBottom>
              Reviews
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClickOpen}
                sx={{ mr: 2 }}
              >
                Add to List
              </Button>

              {isSignedIn && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    navigate(`/book/create/${primary_isbn13}`, {
                      state: { book: bookData },
                    })
                  }
                >
                  Write a Review
                </Button>
              )}
            </Box>

            <Reviews bookIsbn={primary_isbn13} book={bookData} />
          </Grid>
        </Grid>

        {/* Add to List Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add to List</DialogTitle>
          <DialogContent>
            {loadingLists ? (
              <Typography variant="body1">Loading lists...</Typography>
            ) : error ? (
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            ) : (
              <>
                <List>
                  {lists.map((list) => (
                    <ListItem
                      button
                      key={list.id}
                      onClick={() => handleAddToList(list.id)}
                    >
                      <ListItemText primary={list.name} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  onClick={() => setCreatingList(true)}
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Create New List
                </Button>
              </>
            )}
            {creatingList && (
              <Box component="form" onSubmit={handleCreateList} sx={{ mt: 2 }}>
                <TextField
                  label="List Name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  fullWidth
                />
                {creatingListError && (
                  <Typography variant="body2" color="error">
                    {creatingListError}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                  disabled={creatingListLoading}
                >
                  {creatingListLoading ? "Creating..." : "Create"}
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
            elevation={6}
            variant="filled"
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Container>
    </>
  );
}

export default BookDetails;
