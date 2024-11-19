// src/api/lists.js

import axiosInstance from "./axiosInstance";

/**
 * Fetches all reading lists for the current user.
 * @returns {Promise<Array>} An array of reading lists.
 */
export const fetchUserLists = async () => {
  try {
    const response = await axiosInstance.get("/lists");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new reading list.
 * @param {string} name - The name of the new list.
 * @returns {Promise<Object>} The created list.
 */
export const createList = async (name) => {
  try {
    const response = await axiosInstance.post("/lists", { name });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Adds a book to a reading list.
 * @param {string} listId - The ID of the list.
 * @param {Object} book - The book data to add.
 * @returns {Promise<Object>} The response data.
 */
export const addBookToList = async (listId, book) => {
  try {
    const response = await axiosInstance.post(`/lists/${listId}/items`, {
      book,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a book from a reading list.
 * @param {string} listId - The ID of the list.
 * @param {string} bookIsbn - The ISBN of the book.
 * @returns {Promise<Object>} The response data.
 */
export const deleteBookFromList = async (listId, bookIsbn) => {
  try {
    const response = await axiosInstance.delete(
      `/lists/${listId}/items/${bookIsbn}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Moves a book from one list to another.
 * @param {string} currentListId - The ID of the current list.
 * @param {string} bookIsbn - The ISBN of the book.
 * @param {string} targetListId - The ID of the target list.
 * @returns {Promise<Object>} The response data.
 */
export const moveBookToList = async (currentListId, bookIsbn, targetListId) => {
  try {
    const response = await axiosInstance.put(
      `/lists/${currentListId}/items/${bookIsbn}/move/${targetListId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
