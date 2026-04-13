import React, { createContext, useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { registerPushToken } from "../utils/pushNotifications";

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
                    // ✅ Run push registration in background without blocking login
                    try {
                        registerPushToken();
                    } catch (pushErr) {
                        console.warn("Push registration skipped:", pushErr);
                    }
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