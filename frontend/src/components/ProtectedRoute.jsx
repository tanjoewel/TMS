import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import Axios from "axios";

const ProtectedRoute = () => {
  const { setUsername, logout, isAuthenticated, loading, setLoading, setIsAuthenticated, setIsAdmin } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await Axios.get("/verify");
        setIsAuthenticated(true);
        setIsAdmin(response.data.isAdmin);
        setUsername(response.data.username);
      } catch (err) {
        await logout();
        console.log("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
