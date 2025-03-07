import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/getUser`, { withCredentials: true });
        setUser(response.data.user);
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
