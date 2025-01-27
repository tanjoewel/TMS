import React, { useState } from "react";
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Header from "./components/Header";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./AuthContext";
// import { AdminProvider } from "./AdminContext";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  // this is only here because only one level down. if it gets worse it is time to use contexts.
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [isAdmin, setIsAdmin] = useState(false);

  return (
    <AuthProvider>
      {/* <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin} setIsAdmin={setIsAdmin} /> */}
      <Header />
      <Routes>
        {/* <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />} /> */}
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route path="/users" element={<Users />} />
          </Route>
          <Route path="/tasks" element={<Tasks />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
