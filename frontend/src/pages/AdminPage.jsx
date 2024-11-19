// pages/AdminPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { CircularProgress } from "@mui/material";

const AdminPage = () => {
  const { getToken, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      // Make the POST request without the token
      const response = await axios.post(
        "/api/reset",
        {},
        {
          withCredentials: true, // Include this to send cookies
        }
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Failed to reset database:", error);
      alert("Error resetting database.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <button
        onClick={handleReset}
        style={{
          padding: "10px 20px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Database"}
      </button>
    </div>
  );
};

export default AdminPage;
