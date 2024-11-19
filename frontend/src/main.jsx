// main.jsx

import React from "react";
import ReactDOM from "react-dom/client"; // Import from 'react-dom/client' instead of 'react-dom'
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import theme from "./theme";
import App from "./App";
import "./index.css";

// Retrieve your Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Ensure that the publishable key is defined
if (!clerkPubKey) {
  throw new Error(
    "Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file."
  );
}

// Use createRoot instead of ReactDOM.render
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </AuthProvider>
    </ClerkProvider>
  </React.StrictMode>
);
