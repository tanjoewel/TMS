import React, { useState } from "react";
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Header from "./components/Header";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./AuthContext";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import { SnackbarProvider } from "./SnackbarContext";

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/users" element={<Users />} />
            </Route>
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks" element={<Tasks />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
