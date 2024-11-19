// frontend/src/api/books.js

import axiosInstance from "./axiosInstance";
import axios from "axios";

/**
 * Fetches the books feed.
 * @returns {Promise<Object>} The response data.
 */
export const fetchBooksFeed = async () => {
  try {
    const response = await axiosInstance.get("/books/feed");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Searches books based on provided parameters.
 * @param {Object} params - The search parameters (author, title, isbn).
 * @returns {Promise<Object>} The response data.
 */
export const searchBooks = async (params) => {
  try {
    const response = await axiosInstance.get("/books/search", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches a single book by ISBN.
 * @param {string} isbn - The ISBN of the book.
 * @returns {Promise<Object>} The book data.
 */
export const fetchBookByISBN = async (isbn) => {
  try {
    const data = await searchBooks({ isbn });
    // Assuming the API returns a structure with 'results.lists.books'
    const books = data?.results?.lists?.flatMap((list) => list.books) || [];
    return books[0]; // Return the first matching book
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches book data from Google Books API using ISBN.
 * @param {string} isbn - The ISBN of the book.
 * @returns {Promise<Object>} The book data.
 */
export const fetchBookData = async (isbn) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    if (
      response.data.totalItems > 0 &&
      response.data.items &&
      response.data.items.length > 0
    ) {
      const bookInfo = response.data.items[0].volumeInfo;
      return {
        title: bookInfo.title || "No Title",
        author: bookInfo.authors
          ? bookInfo.authors.join(", ")
          : "Unknown Author",
        book_image: bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : "",
        description: bookInfo.description || "No Description Available.",
        amazon_product_url: bookInfo.infoLink || "",
        primary_isbn13: isbn,
      };
    } else {
      return {
        title: "No Title",
        author: "Unknown Author",
        book_image: "",
        description: "No Description Available.",
        amazon_product_url: "",
        primary_isbn13: isbn,
      };
    }
  } catch (err) {
    console.error(`Error fetching book data for ISBN ${isbn}:`, err);
    return {
      title: "No Title",
      author: "Unknown Author",
      book_image: "",
      description: "No Description Available.",
      amazon_product_url: "",
      primary_isbn13: isbn,
    };
  }
};
