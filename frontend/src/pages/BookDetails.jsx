// pages/BookDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
  Alert,
  TextField,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import Reviews from "../components/Reviews.jsx";
import BookProfile from "../components/BookProfile";
import { useAuth } from "@clerk/clerk-react";

function BookDetails() {
  const location = useLocation();
  const { book } = location.state || {};
  const { isSignedIn, getToken } = useAuth(); // Include getToken
  const navigate = useNavigate();

  // State variables for the "Add to List" dialog
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [error, setError] = useState(null);

  // State variables for creating a new list
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingListError, setCreatingListError] = useState(null);
  const [creatingListLoading, setCreatingListLoading] = useState(false);

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

  const handleAddToList = async (listId) => {
    try {
      await axios.post(
        `http://localhost:3000/api/lists/${listId}/items`,
        { book_isbn: book.primary_isbn13 },
        { withCredentials: true }
      );
      setOpen(false);
      alert(`Book added to ${lists.find((l) => l.list_id === listId).name}!`);
    } catch (err) {
      console.error("Error adding book to list:", err);
      alert("Failed to add book to list.");
    }
  };

  const handleClickOpen = async () => {
    if (!isSignedIn) {
      alert("Please sign in to add books to your lists.");
      navigate("/sign-in");
      return;
    }

    setOpen(true);
    setLoadingLists(true);
    try {
      const token = await getToken(); // Obtain the session token

      const response = await axios.get("http://localhost:3000/api/lists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setLists(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching lists:", err);
      setError("Failed to fetch lists.");
    } finally {
      setLoadingLists(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatingList(false);
    setNewListName("");
    setCreatingListError(null);
  };

  const handleCreateNewList = async () => {
    if (!newListName.trim()) {
      setCreatingListError("List name cannot be empty.");
      return;
    }

    setCreatingListLoading(true);
    setCreatingListError(null);

    try {
      const token = await getToken(); // Obtain the session token

      const response = await axios.post(
        "http://localhost:3000/api/lists",
        { name: newListName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const newList = response.data;

      // Update the lists state with the new list
      setLists([...lists, newList]);

      // Reset new list creation state
      setCreatingList(false);
      setNewListName("");

      // Optionally, automatically add the book to the new list
      handleAddToList(newList.list_id);
    } catch (err) {
      console.error("Error creating new list:", err);
      setCreatingListError("Failed to create list.");
    } finally {
      setCreatingListLoading(false);
    }
  };

  const {
    title,
    author,
    book_image,
    description,
    amazon_product_url,
    primary_isbn13,
  } = book;

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
            {/* Integrate the Reviews component */}
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
                      state: { book },
                    })
                  }
                >
                  Write a Review
                </Button>
              )}
            </Box>

            <Reviews bookIsbn={primary_isbn13} book={book} />
          </Grid>
        </Grid>

        {/* Add to List Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {!creatingList ? "Select a List" : "Create a New List"}
          </DialogTitle>
          <DialogContent>
            {loadingLists ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <>
                {!creatingList ? (
                  <>
                    <List>
                      {lists.length > 0 ? (
                        lists.map((list) => (
                          <ListItem
                            button
                            onClick={() => handleAddToList(list.list_id)}
                            key={list.list_id}
                          >
                            <ListItemText primary={list.name} />
                          </ListItem>
                        ))
                      ) : (
                        <Typography>No lists found.</Typography>
                      )}
                    </List>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => setCreatingList(true)}
                    >
                      Create New List
                    </Button>
                  </>
                ) : (
                  <>
                    <TextField
                      label="List Name"
                      fullWidth
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      sx={{ mt: 1 }}
                    />
                    {creatingListError && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {creatingListError}
                      </Alert>
                    )}
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            {!creatingList ? (
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
            ) : (
              <>
                <Button onClick={() => setCreatingList(false)} color="primary">
                  Back
                </Button>
                <Button
                  onClick={handleCreateNewList}
                  color="primary"
                  disabled={creatingListLoading}
                >
                  {creatingListLoading ? "Creating..." : "Create"}
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default BookDetails;
