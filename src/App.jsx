import React from "react";
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Routes } from "react-router-dom";
import Login from "./pages/Login";
import About from "./pages/About";
import Users from "./pages/Users";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </>
  );
}

export default App;
