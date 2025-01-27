import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Axios from "axios";

const ProtectedRoute = () => {
  const { setUsername, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await Axios.get("/verify");
        setUsername(response.data.username);
      } catch (err) {
        console.log("Auth check failed", err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
