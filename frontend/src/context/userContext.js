import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const tokenData = localStorage.getItem("GullyFoodsUserToken");
        if (!tokenData) {
          setUser(null);
          setReady(true);
          return;
        }

        const parsedToken = JSON.parse(tokenData);
        const now = new Date().getTime();

        // Check token expiry
        if (!parsedToken.token || !parsedToken.expiry || now > parsedToken.expiry) {
          localStorage.removeItem("GullyFoodsUserToken");
          setUser(null);
          setReady(true);
          return;
        }

        // Valid token, fetch user
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/getUser`,
          { headers: { Authorization: `Bearer ${parsedToken.token}` } }
        );

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem("GullyFoodsUserToken");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("GullyFoodsUserToken");
        setUser(null);
      } finally {
        setReady(true);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
