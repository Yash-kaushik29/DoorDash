import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SellerHeader from "../../components/SellerHeader";
import axios from "axios";
import SellerDashboardSkeleton from "../../skeletons/SellerDashboardSkeleton ";
import notificationSound from "../../sound/notificationSound.mp3";
import { ToastContainer, toast } from "react-toastify";
import api from "../../utils/axiosInstance";
import { SellerContext } from "../../context/sellerContext";

const audio = new Audio(notificationSound);

const SellerDashboard = () => {
  const {sellerId, ready} = useContext(SellerContext);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unlockAudio = () => {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          document.removeEventListener("click", unlockAudio);
        })
        .catch(() => {});
    };
    document.addEventListener("click", unlockAudio);
    return () => document.removeEventListener("click", unlockAudio);
  }, []);

  // useEffect(() => {
  //   if (!token) return;

  //   const pollNotifications = async () => {
  //     try {
  //       const { data } = await api.get(
  //         `/api/notification/unread-order-notifications`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       if (data.success && data.count > 0) {
  //         audio.play();
  //         toast.info(`📦 ${data.count} new orders`);
  //       }
  //     } catch (err) {
  //       console.error("Polling error:", err);
  //     }
  //   };

  //   const interval = setInterval(pollNotifications, 5 * 60 * 1000);
  //   return () => clearInterval(interval);
  // }, [token]);

  const fetchSeller = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/api/auth/getSellerDetails`,
        {withCredentials: true},
      );

      if (data.success) setSeller(data.sellerDetails);
      else setError(data.message);
    } catch (err) {
      console.error(err);
      setError("Failed to load seller details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && !sellerId) navigate("/seller-login");
    else fetchSeller();
  }, [sellerId, navigate]);

  const takeToLogin = () => {
    window.location.reload();
  };

  if (loading) return <SellerDashboardSkeleton />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
            <button
              onClick={fetchSeller}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Retry
            </button>
            <button
              onClick={takeToLogin}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <ToastContainer />
      <SellerHeader />

      {/* Welcome Section */}
      <div className="max-w-5xl mx-auto p-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
          Welcome, {seller?.username || "Seller"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your products and track your sales efficiently.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link
          className="action-card bg-green-500 hover:bg-green-600"
          to="/seller/add-product"
        >
          ➕ Add Product
        </Link>
        <Link
          className="action-card bg-blue-500 hover:bg-blue-600"
          to="/seller/my-products"
        >
          🛒 View Products
        </Link>
        <Link
          className="action-card bg-yellow-500 hover:bg-yellow-600"
          to="/seller/my-orders"
        >
          📦 Manage Orders
        </Link>
        {seller?.shop ? (
          <Link
            className="action-card bg-purple-500 hover:bg-purple-600"
            to={`/seller/edit-shop/${seller.shop}`}
          >
            🏪 Edit Shop Details
          </Link>
        ) : (
          <Link
            className="action-card bg-teal-500 hover:bg-teal-600"
            to="/seller/add-shop"
          >
            🏪 Add Shop
          </Link>
        )}
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card bg-white dark:bg-gray-800 text-green-500 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Total Sales
          </h2>
          <p className="text-2xl font-bold">₹{seller.todaySalesTotal}</p>

          {/* Link Button */}
          <Link
            to="/seller/sales-history"
            className="mt-4 inline-block underline text-green-500 px-4 py-2 rounded-lg shadow-md transition"
          >
            View Sales History
          </Link>
        </div>
        <div className="stat-card bg-white dark:bg-gray-800 text-yellow-500">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Pending Orders
          </h2>
          <p className="text-2xl font-bold">{seller?.pendingOrdersCount}</p>
        </div>
        <div className="stat-card bg-white dark:bg-gray-800 text-blue-500">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Total Products
          </h2>
          <p className="text-2xl font-bold">{seller?.productsCount}</p>
        </div>
      </div>

      <style jsx>{`
        .action-card {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.5rem;
          color: white;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .action-card:hover {
          transform: translateY(-2px);
        }
        .stat-card {
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default SellerDashboard;
