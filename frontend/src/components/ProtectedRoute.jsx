import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Axios from "axios";
import { SNACKBAR_SEVERITIES, useSnackbar } from "../SnackbarContext";

const ProtectedRoute = () => {
  const { setUsername, logout, isAuthenticated, loading, setLoading, setIsAuthenticated, setIsAdmin } = useAuth();

  const { showSnackbar } = useSnackbar();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await Axios.get("/verify");
        if (response.data.isEnabled === 0) {
          await logout();
          const snackbarMessage = "Your account has been disabled.";
          showSnackbar(snackbarMessage, SNACKBAR_SEVERITIES[1]);
        } else {
          setIsAuthenticated(true);
          setIsAdmin(response.data.isAdmin);
          setUsername(response.data.username);
        }
      } catch (err) {
        await logout();
        showSnackbar(err.response.data.message, SNACKBAR_SEVERITIES[1]);
        console.log("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
