import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";
import { useParams } from "react-router-dom";
import api from "../../utils/axiosInstance";

const SellerDetails = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sales, setSales] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 1. Seller info
        const sellerRes = await api.get(
          `/api/admin/seller/${sellerId}`
        );
        setSeller(sellerRes.data);
      } catch (err) {
        console.error("Error fetching seller details:", err);
      }
    };

    fetchDetails();
  }, [sellerId]);

  const fetchEarnings = async () => {
    try {
      const dateToSend = selectedDate || new Date().toISOString().split("T")[0];
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/seller/${sellerId}/sales`,
        { params: { date: dateToSend } }
      );

      if (res.data.success) {
        setTotalEarnings(res.data.totalEarnings);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [selectedDate]);

  if (!seller) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AdminHeader />
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition duration-300 ease-in-out">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Seller Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Username:</strong> {seller.username}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Email:</strong> {seller.email}
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2 text-gray-800 dark:text-gray-100">
          Shop Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Shop Name:</strong> {seller.shop.name}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Category:</strong> {seller.shop.category}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Status:</strong>
          <span
            className={`px-2 py-1 rounded-full ${
              seller.shop.isOpen ? "text-green-500" : "text-red-500"
            }`}
          >
            {seller.shop.isOpen ? "Open" : "Closed"}
          </span>
        </p>

        {/* Sales Section */}
        <h2 className="text-2xl font-bold mt-6 mb-4 text-gray-800 dark:text-gray-100">
          Sales History
        </h2>
        <div className="mb-4 flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
            Total: <span className="text-green-600">
              ₹
            {totalEarnings.length > 0 && totalEarnings
              ?.reduce((sum, sale) => sum + sale?.amount, 0)
              .toFixed(2)}
            </span>
          </span>
        </div>

        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-700">
              <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">
                Time
              </th>
              <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {totalEarnings.length > 0 ? (
              totalEarnings.map((sale, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
                >
                  <td className="py-3 px-4 text-blue-600 font-semibold">
                    {new Date(sale.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="py-3 px-4 text-green-600 font-semibold">
                    ₹{sale.amount}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerDetails;
