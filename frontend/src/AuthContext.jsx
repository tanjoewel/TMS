import React, { createContext, useState, useEffect, useContext } from "react";
import Axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async (username) => {
    setUsername(username);
    await checkAdmin(username);
    setIsAuthenticated(true);
  };

  const logout = () => {
    Axios.post("/logout");
    setUsername(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, username, isAdmin, checkAdmin, setUsername, setIsAdmin, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
