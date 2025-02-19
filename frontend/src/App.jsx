// React imports
import React from "react";
import { Route, Routes } from "react-router-dom";
// pages and components
// this will be rendered on every page
import Header from "./components/Header";
// these will be rendered when specific paths
import Users from "./pages/Users";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import NotFound from "./pages/NotFound";
// authentication and authorization
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
// contexts
import { AuthProvider } from "./AuthContext";
import { SnackbarProvider } from "./SnackbarContext";
import Kanban from "./pages/Kanban";

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
            <Route path="/app" element={<Applications />} />
            <Route path="/kanban" element={<Kanban />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
