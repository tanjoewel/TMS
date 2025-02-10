import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const login = async (username) => {
    setUsername(username);
    console.log(username);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await Axios.post("/logout");
    setUsername(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    navigate("/");
  };

  const checkAdmin = async function (username) {
    const response = await Axios.post("/groups/checkgroup", { username, groupname: "admin" });
    if (response.data === true) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    return response;
  };

  const verify = async function () {
    console.log("verify ran");
    try {
      const response = await Axios.get("/verify");
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, username, isAdmin, checkAdmin, setUsername, setIsAdmin, setIsAuthenticated, verify, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
