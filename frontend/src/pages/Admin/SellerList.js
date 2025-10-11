import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";
import { Link } from "react-router-dom";
import api from "../../utils/axiosInstance";

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSellers, setFilteredSellers] = useState([]);

  // Fetch all sellers on component mount
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await api.get(`/api/admin/sellers`);
        setSellers(res.data);
        setFilteredSellers(res.data);
      } catch (err) {
        console.error("Error fetching sellers:", err);
      }
    };

    fetchSellers();
  }, []);

  // Filter sellers based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = sellers.filter(
      (seller) =>
        seller.username.toLowerCase().includes(term) ||
        (seller.shop && seller.shop.name.toLowerCase().includes(term))
    );
    setFilteredSellers(filtered);
  }, [searchTerm, sellers]);

  return (
    <div>
      <AdminHeader />
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Sellers List
        </h2>

        <input
          type="text"
          placeholder="Search by Username or Shop Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded-md mb-4 w-full text-gray-800 dark:text-gray-100"
        />

        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-100">
                Username
              </th>
              <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-100">
                Email
              </th>
              <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-100">
                Shop Name
              </th>
              <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-100">
                Shop Category
              </th>
              <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-100">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.map((seller) => (
              <tr
                key={seller._id}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="py-2 px-4 text-gray-800 dark:text-gray-100">
                  {seller.username}
                </td>
                <td className="py-2 px-4 text-gray-800 dark:text-gray-100">
                  {seller.email}
                </td>
                <td className="py-2 px-4 text-gray-800 dark:text-gray-100">
                  {seller.shop?.name || "No Shop"}
                </td>
                <td className="py-2 px-4 text-gray-800 dark:text-gray-100">
                  {seller.shop?.category || "N/A"}
                </td>
                <td className="py-2 px-4">
                  <Link
                    to={`/admin/seller/${seller._id}`}
                    className="text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSellers.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
            No sellers found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SellerList;
