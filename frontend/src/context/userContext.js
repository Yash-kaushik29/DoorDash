import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(
                    `/api/auth/getUser`,
                    {withCredentials: true},
                );

                console.log(response)

                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                // If 401 Unauthorized, the session has expired or is invalid.
                setUser(null);
            } finally {
                setReady(true);
            }
        };

        if (!user) {
            fetchUser();
        }
        
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, ready }}>
            {children}
        </UserContext.Provider>
    );
}