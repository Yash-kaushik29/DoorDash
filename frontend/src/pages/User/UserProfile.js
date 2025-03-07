import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { IoLogOut } from "react-icons/io5";
import { UserContext } from "../../context/userContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import {
  MdHelp,
  MdLocationOn,
  MdNotifications,
  MdSettings,
  MdShoppingCart,
} from "react-icons/md";

const UserProfile = () => {
  const { user, setUser, ready } = useContext(UserContext);
  const [username, setUsername] = useState(user?.name);
  const navigate = useNavigate();

  if (ready && !user) {
    navigate("/");
  }

  const handleLogout = async () => {
    const { data } = await axios.get(
      "http://localhost:5000/api/user-profile/logout",
      {
        withCredentials: true,
      }
    );

    if (data.success === true) {
      toast.success("You have been logged out!");
      setTimeout(() => {
        setUser(null);
        navigate("/");
      }, 1000);
    } else {
      toast.error("Failed to logout!");
    }
  };

  if (!ready) return <>Loading...</>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex justify-center items-start p-4">
        <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {/* User's Name */}
          <div className="text-center">
            <h1 className="text-4xl font-bold">{username || "User"}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome to your profile
            </p>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition"
            >
              Logout
            </button>
          </div>

          {/* Navigation Buttons */}
          {user && (
            <div className="mt-8 space-y-4">
              <Link
                to="/notifications"
                className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <span className="font-semibold text-lg">Notifications</span>
                <MdNotifications className="text-2xl text-green-500" />
              </Link>

              <Link
                to="/recentOrders"
                className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <span className="font-semibold text-lg">Orders</span>
                <MdShoppingCart className="text-2xl text-green-500" />
              </Link>

              <Link
                to={`/user/addresses/${user._id}`}
                className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <span className="font-semibold text-lg">Addresses</span>
                <MdLocationOn className="text-2xl text-green-500" />
              </Link>

              <Link
                to="/account-settings"
                className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <span className="font-semibold text-lg">Account Settings</span>
                <MdSettings className="text-2xl text-green-500" />
              </Link>

              <Link
                to="/help-support"
                className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <span className="font-semibold text-lg">Help & Support</span>
                <MdHelp className="text-2xl text-green-500" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;
