// frontend/src/contexts/AuthContext.jsx

import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setAuthToken } from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          setAuthToken(token);
        } catch (error) {
          console.error("Error setting auth token:", error);
          setAuthToken(null);
        }
      } else {
        setAuthToken(null);
      }
    };
    initializeAuth();
  }, [isSignedIn, getToken]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
