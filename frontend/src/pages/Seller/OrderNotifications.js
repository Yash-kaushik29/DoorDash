import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SellerHeader from "../../components/SellerHeader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../utils/axiosInstance";

const OrderNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleError = (err, defaultMessage) => {
    console.error(err);

    const message =
      err.response?.data?.message ||
      (err.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : err.message?.includes("Network Error")
        ? "Network issue detected. Check your internet connection."
        : defaultMessage);

    setError(message);
    toast.error(message);
  };

  const fetchNotifications = async (retry = false) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/notification/getSellerNotifications`, {
        withCredentials: true,
        timeout: 7000,
      });

      if (data.success) {
        setNotifications(data.notifications);
        setFilteredNotifications(data.notifications);
      } else {
        setError(data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      handleError(err, "Error fetching notifications. Please try again later.");

      if (
        !retry &&
        (err.code === "ECONNABORTED" || err.message.includes("Network"))
      ) {
        setTimeout(() => fetchNotifications(true), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (filter === "All") setFilteredNotifications(notifications);
    else if (filter === "Read")
      setFilteredNotifications(notifications.filter((n) => n.read));
    else setFilteredNotifications(notifications.filter((n) => !n.read));
  }, [filter, notifications]);

  const markAsRead = async (notifId) => {
    try {
      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );

      await api.put(`/api/notification/read/${notifId}`, {}, { withCredentials: true });
    } catch (err) {
      toast.error("Failed to mark notification as read.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <SellerHeader />
        <div className="max-w-xl mx-auto p-4 space-y-2 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-md"
            ></div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SellerHeader />
        <div className="text-center text-red-500 mt-8">
          <p>{error}</p>
          <button
            onClick={() => fetchNotifications()}
            className="mt-3 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="mb-16 lg:mb-0">
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />

      <div className="p-4 max-w-xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Notifications
        </h2>

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-4 border-b pb-2">
          {["All", "Read", "Unread"].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-1 text-sm font-medium rounded transition ${
                filter === category
                  ? "bg-green-600 text-white dark:bg-green-500"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredNotifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No notifications found.
          </p>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-3 border rounded mb-2 flex justify-between items-center transition-all ${
                notif.read
                  ? "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg"
              }`}
            >
              <div>
                <p className="text-gray-900 dark:text-gray-100">
                  {notif.message}
                </p>
                <small className="text-gray-500 dark:text-gray-400">
                  {new Date(notif.createdAt).toLocaleString()}
                </small>
              </div>

              <Link
                to={`/getOrderDetails/${notif.order}`}
                onClick={() => markAsRead(notif._id)}
                className="px-3 py-1 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded hover:bg-green-700 dark:hover:bg-green-400 transition"
              >
                View
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderNotifications;
