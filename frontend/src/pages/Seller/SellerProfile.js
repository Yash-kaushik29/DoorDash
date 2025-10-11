import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerHeader from "../../components/SellerHeader";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";

const SellerProfile = () => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("GullyFoodsSellerToken");

  useEffect(() => {
    const fetchSellerProfile = async () => {
      setLoading(true);
      setError("");

      try {
        if (!token) {
          setError("No token found. Please login.");
          setTimeout(() => navigate("/seller"), 2000);
          return;
        }

        const { data } = await api.get(
          `/api/shop/seller-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          console.log(data.seller);
          setSeller(data.seller);
        } else {
          setError(data.message || "Failed to load seller profile");
          setTimeout(() => navigate("/seller"), 2000);
        }
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        setError("Failed to load profile. Please try again later.");
        setError("Failed to load seller profile");
        setTimeout(() => navigate("/seller"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, [navigate]);

  const handleToggleShopStatus = async () => {
    try {
      const updatedStatus = !seller?.shop?.isOpen;
      await api.put(
        `/api/shop/update-status`,
        { isOpen: updatedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSeller((prev) => ({
        ...prev,
        shop: { ...prev.shop, isOpen: updatedStatus },
      }));

      toast.success(`Shop is now ${updatedStatus ? "Open" : "Closed"}!`);
    } catch (error) {
      console.error("Error updating shop status:", error);
      toast.error("Failed to update shop status.");
    }
  };

  const calculateSales = () => {
    return seller.salesHistory.reduce((sum, sale) => sum + sale.amount, 0);
  };

  if (loading) return <div className="text-center text-lg">Loading...</div>;

  if (error)
    return (
      <div className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />

      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Page Heading */}
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
          Seller Dashboard
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Seller Info */}
          <div className="flex-1 space-y-6">
            {/* Seller Details Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-300">
              <h2 className="text-2xl font-bold mb-4">Seller Info</h2>
              <div className="space-y-2">
                <p>
                  <strong>Username:</strong> {seller?.username || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {seller?.email || "N/A"}
                </p>
                <p>
                  <strong>Total Sales:</strong> ₹{calculateSales()}
                </p>
                <p>
                  <strong>Orders Completed:</strong> {seller?.totalOrders || 0}
                </p>
              </div>
              <Link
                to="/seller/edit-profile"
                className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Edit Profile
              </Link>
            </div>

            {/* Analytics Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-300">
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-100 dark:bg-purple-700 p-4 rounded-lg transition-colors duration-300">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    Monthly Sales
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{seller?.monthlySales || 0}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-700 p-4 rounded-lg transition-colors duration-300">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    Active Orders
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {seller?.activeOrders || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Shop Info */}
          <div className="flex-1 space-y-6">
            {seller?.shop ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4 transition-colors duration-300">
                <h2 className="text-2xl font-bold">Shop Info</h2>

                <p>
                  <strong>Name:</strong> {seller.shop.name || "N/A"}
                </p>
                <p>
                  <strong>Category:</strong> {seller.shop.category || "N/A"}
                </p>
                <p>
                  <strong>Products:</strong>{" "}
                  {seller.shop.productCategories?.join(", ") || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {seller.shop.address?.addressLine || "N/A"},{" "}
                  {seller.shop.address?.city || "N/A"}
                </p>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      seller.shop.isOpen ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {seller.shop.isOpen ? "Open" : "Closed"}
                  </span>
                  {seller.shop.isManuallyClosed && (
                    <span className="px-2 py-1 bg-yellow-500 text-gray-900 rounded-full text-sm">
                      Manually Closed
                    </span>
                  )}
                </div>

                <button
                  onClick={handleToggleShopStatus}
                  className={`mt-4 w-full py-2 rounded-lg font-semibold text-white ${
                    seller.shop.isOpen
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } transition`}
                >
                  {seller.shop.isOpen ? "Close Shop" : "Open Shop"}
                </button>

                {/* Shop Images */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Shop Images</h3>
                  {seller.shop.images?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {seller.shop.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Shop ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No Images Available
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-400 p-4 rounded-lg transition-colors duration-300">
                No shop details found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
