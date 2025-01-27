import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useAuth } from "../AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { isAdmin, username, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  // runs when the component first mounts, which is when the child pages are loaded.
  useEffect(() => {
    // verify that the user is authorized. To do this, we should check if the user is an admin? No, we should have admin routes as well.
    const checkAdmin = async () => {
      setLoading(true);
      try {
        const response = await Axios.post("/groups/checkgroup", { username, groupname: "admin" });
        if (!response.data) {
          console.log("Admin check ran but failed");
          logout();
        }
      } catch (err) {
        // log the user out
        console.log("Error checking groups in admin route");
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
