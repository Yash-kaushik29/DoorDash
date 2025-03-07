import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState("All"); // 'All', 'Read', 'Unread'
  const { user } = useContext(UserContext);
  const [selectedNotification, setSelectedNotification] = useState(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user || !user._id) return;

        const { data } = await axios.get(
          `http://localhost:5000/api/notification/getNotifications/${user._id}`,
          { withCredentials: true }
        );

        setNotifications(data);
        setFilteredNotifications(data); // Initially show all
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (filter === "All") {
      setFilteredNotifications(notifications);
    } else if (filter === "Read") {
      setFilteredNotifications(notifications.filter((notif) => notif.read));
    } else {
      setFilteredNotifications(notifications.filter((notif) => !notif.read));
    }
  }, [filter, notifications]);

  const showNotification = async(notif) => {
    const {data} = await axios.post(`http://localhost:5000/api/notification/readNotification`, {userId: user._id, notificationId: notif._id}, {withCredentials: true});
    
    if(data.success) {
      setSelectedNotification(notif)
    }
  }

  const closeModal = () => {
    setSelectedNotification(null);
  };

  if (!user) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="mb-16 lg:mb-0">
      <Navbar />

      <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Notifications
      </h2>

      {/* Filter Tabs */}
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

      {/* Notifications List */}
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
              <p className="text-gray-900 dark:text-gray-100">{notif.message}</p>
              <small className="text-gray-500 dark:text-gray-400">
                {new Date(notif.createdAt).toLocaleString()}
              </small>
            </div>
            <button
              className="px-3 py-1 text-sm font-medium text-white bg-green-600 dark:bg-green-500 rounded hover:bg-green-700 dark:hover:bg-green-400 transition"
              onClick={() => showNotification(notif)}
            >
              View
            </button>
          </div>
        ))
      )}

      {/* Modal Popup */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal} // Close modal when clicking outside
        >
          <div
            className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg w-96 relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={closeModal}
            >
              ✖
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notification Details
            </h3>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {selectedNotification.message}
            </p>
            <small className="text-gray-500 dark:text-gray-400 block mt-2">
              {new Date(selectedNotification.createdAt).toLocaleString()}
            </small>
            <div className="flex justify-around">
            <Link to={`${selectedNotification.url}`} className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 transition">
              Track Order
            </Link>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 transition"
              onClick={closeModal}
            >
              Close
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Notifications;

