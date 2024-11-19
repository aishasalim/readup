// pages/AdminPage.jsx

import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { CircularProgress } from "@mui/material";
import { resetDatabase } from "../api/admin"; // Import the API function

const AdminPage = () => {
  const { isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const data = await resetDatabase(); // Use the API function
      alert(data.message);
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
