import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SellerHeader from "../../components/SellerHeader";
import axios from "axios";
import SellerDashboardSkeleton from "../../skeletons/SellerDashboardSkeleton ";

const SellerDashboard = () => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("doordash-seller");

  const fetchSeller = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/getSellerDetails`,
        { withCredentials: true }
      );

      if (data.success) {
        setSeller(data.sellerDetails);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error fetching seller details:", err);
      setError("Failed to load seller details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/seller-login");
    } else {
      fetchSeller();
    }
  }, [token, navigate]);

  const takeToLogin = () => {
    localStorage.setItem("doordash-seller", "");
    window.location.reload();
  }

  if (loading) return <SellerDashboardSkeleton />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <div className="flex gap-2 mt-4 items-center justify-center">
            <div>
              <button
                onClick={fetchSeller}
                className=" bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
            <div>
              <button
                 onClick={takeToLogin}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <SellerHeader />

      {/* Welcome Section */}
      <div className="max-w-5xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Welcome, {seller?.username || "Seller"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your products and track your sales efficiently.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <Link
          to="/seller/add-product"
          className="bg-green-500 text-white p-4 rounded-lg text-center shadow-md hover:bg-green-600"
        >
          ➕ Add Product
        </Link>
        <Link
          to="/seller/my-products"
          className="bg-blue-500 text-white p-4 rounded-lg text-center shadow-md hover:bg-blue-600"
        >
          🛒 View Products
        </Link>
        <Link
          to="/seller/my-orders"
          className="bg-yellow-500 text-white p-4 rounded-lg text-center shadow-md hover:bg-yellow-600"
        >
          📦 Manage Orders
        </Link>
        {seller?.shop ? (
          <Link
            to={`/seller/edit-shop/${seller.shop}`}
            className="bg-purple-500 text-white p-4 rounded-lg text-center shadow-md hover:bg-purple-600"
          >
            🏪 Edit Shop Details
          </Link>
        ) : (
          <Link
            to="/seller/add-shop"
            className="bg-teal-500 text-white p-4 rounded-lg text-center shadow-md hover:bg-teal-600"
          >
            🏪 Add Shop
          </Link>
        )}
      </div>

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Total Sales
          </h2>
          <p className="text-2xl font-bold text-green-500">₹{seller.sales}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Pending Orders
          </h2>
          <p className="text-2xl font-bold text-yellow-500">
            {seller?.pendingOrdersCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Total Products
          </h2>
          <p className="text-2xl font-bold text-blue-500">
            {seller?.productsCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
