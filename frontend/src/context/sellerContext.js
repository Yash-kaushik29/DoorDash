import React, { createContext, useEffect, useState } from "react";
import api from "../utils/axiosInstance";

export const SellerContext = createContext();

export function SellerContextProvider({ children }) {
    const [sellerId, setSellerId] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const fetchSeller = async () => {
            try {
                const response = await api.get(
                    `/api/auth/getSeller`,
                    {withCredentials: true},
                );

                if (response.data.success) {
                    setSellerId(response.data.sellerId);
                } else {
                    setSellerId(null);
                }
            } catch (error) {
                setSellerId(null);
            } finally {
                setReady(true);
            }
        };

        if (!sellerId) {
            fetchSeller();
        }  
    }, []);

    return (
        <SellerContext.Provider value={{ sellerId, setSellerId, ready }}>
            {children}
        </SellerContext.Provider>
    );
}