import React, { createContext, useEffect, useState } from "react";
import api from "../utils/axiosInstance";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(
                    `/api/auth/getUser`,
                    {withCredentials: true},
                );

                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
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