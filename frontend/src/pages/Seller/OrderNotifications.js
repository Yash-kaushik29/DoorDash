import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SellerHeader from "../../components/SellerHeader";
import api from "../../utils/axiosInstance";

const OrderNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("GullyFoodsSellerToken");

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(
          `/api/notification/getSellerNotifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          setNotifications(data.notifications);
          setFilteredNotifications(data.notifications);
        } else {
          setError("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("An error occurred while fetching notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (filter === "All") {
      setFilteredNotifications(notifications);
    } else if (filter === "Read") {
      setFilteredNotifications(notifications.filter((notif) => notif.read));
    } else {
      setFilteredNotifications(notifications.filter((notif) => !notif.read));
    }
  }, [filter, notifications]);

  const markAsRead = async (notifId) => {
    try {
      await axios.put(
        `/api/notification/read/${notifId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  if (error)
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="mb-16 lg:mb-0">
      <SellerHeader />

      <div className="p-4 max-w-xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Notifications
        </h2>

        <div className="flex space-x-4 mb-4 border-b pb-2">
          {["All", "Read", "Unread"].map((category) => (
            <button
              key={category}
              className={`px-4 py-1 text-sm font-medium rounded transition ${
                filter === category
                  ? "bg-green-600 text-white dark:bg-green-500"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredNotifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No notifications</p>
        ) : (
          filteredNotifications.map((notif, index) => (
            <div
              key={index}
              className={`p-3 border rounded mb-2 flex justify-between items-center transition-colors ${
                notif.read
                  ? "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
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
