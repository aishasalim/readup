// frontend/src/api/reviews.js

import axiosInstance from "./axiosInstance";

/**
 * Fetches all reviews for a specific book ISBN.
 * @param {string} bookIsbn - The ISBN of the book.
 * @returns {Promise<Array>} An array of reviews.
 */
export const fetchReviewsByISBN = async (bookIsbn) => {
  try {
    const response = await axiosInstance.get(`/reviews/${bookIsbn}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches all reviews by a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} An array of reviews.
 */
export const fetchReviewsByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/reviews/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new review for a specific book ISBN.
 * @param {string} bookIsbn - The ISBN of the book.
 * @param {Object} reviewData - The review data (stars, review_text).
 * @returns {Promise<Object>} The created review.
 */
export const createReview = async (bookIsbn, reviewData) => {
  try {
    const response = await axiosInstance.post(`/reviews`, {
      book_isbn: bookIsbn,
      ...reviewData,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches a specific review by its ID.
 * @param {string} reviewId - The ID of the review.
 * @returns {Promise<Object>} The review data.
 */
export const fetchReviewById = async (reviewId) => {
  try {
    const response = await axiosInstance.get(`/reviews/review/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing review.
 * @param {string} reviewId - The ID of the review.
 * @param {Object} updatedData - The updated review data (stars, review_text).
 * @returns {Promise<Object>} The updated review.
 */
export const updateReview = async (reviewId, updatedData) => {
  try {
    const response = await axiosInstance.put(
      `/reviews/review/${reviewId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a review by its ID.
 * @param {string} reviewId - The ID of the review.
 * @returns {Promise<Object>} The response data.
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Toggles an upvote for a review.
 * @param {string} reviewId - The ID of the review.
 * @returns {Promise<Object>} The updated upvote status and count.
 */
export const toggleUpvote = async (reviewId) => {
  try {
    const response = await axiosInstance.post(`/reviews/${reviewId}/upvote`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
