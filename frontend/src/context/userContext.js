import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("GullyFoodsUserToken");
        if (!token) {
          setUser(null);
          setReady(true);
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/getUser`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
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
