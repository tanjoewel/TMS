// import React, { createContext, useState, useEffect, useContext } from "react";
// import Axios from "axios";

// const AdminContext = createContext();

// export const useAdmin = () => useContext(AdminContext);

// export const AdminProvider = ({ children }) => {
//   const [isAdmin, setIsAdmin] = useState(false);

//   const checkGroup = async function (username, groupname) {
//     const response = await Axios.post("/groups/checkgroup", { username, groupname });
//     console.log(response.data);
//     if (response.data === true) {
//       setIsAdmin(true);
//     } else {
//       setIsAdmin(false);
//     }
//     return response;
//   };

//   return <AdminContext.Provider value={{ isAdmin, checkGroup }}>{children}</AdminContext.Provider>;
// };
