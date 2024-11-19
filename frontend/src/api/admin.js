// src/api/admin.js

import axiosInstance from "./axiosInstance";

// Function to reset the database
export const resetDatabase = async () => {
  const response = await axiosInstance.post("/reset");
  return response.data;
};
