import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { IoLogOut } from "react-icons/io5";
import { UserContext } from "../../context/userContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import {
  MdDescription,
  MdHelp,
  MdLocationOn,
  MdNotifications,
  MdPolicy,
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
      `${process.env.REACT_APP_API_URL}/api/user-profile/logout`,
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

  return (
    <>
      <Navbar />
      {ready === false ? (
        <div className="flex justify-center items-center space-x-2 h-[100vh]">
          <span className="w-3 h-3 mb-4 bg-green-700 rounded-full animate-bounce [animation-delay:0s]"></span>
          <span className="w-3 h-3 mb-4 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-3 h-3 mb-4 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-start p-4 mb-16 lg:mb-0">
          {user && (
            <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="relative bg-gradient-to-r from-green-400 to-green-600 p-6 text-center text-white">
                {/* Avatar (Fallback to initials) */}
                <div className="w-20 h-20 mx-auto rounded-full bg-white text-green-600 flex items-center justify-center text-3xl font-bold shadow-md">
                  {user.name?.charAt(0) || "U"}
                </div>
                <h1 className="mt-3 text-2xl font-bold">
                  {user.name || "User"}
                </h1>
                <p className="text-sm">{user.phone}</p>

                {/* Logout Icon */}
                <button
                  onClick={handleLogout}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-500 hover:bg-red-600 transition"
                >
                  <IoLogOut className="text-white text-xl" />
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                <Link
                  to="/notifications"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:scale-105 transition"
                >
                  <span className="font-semibold">Notifications</span>
                  <MdNotifications className="text-2xl text-green-500" />
                </Link>

                <Link
                  to="/recentOrders"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:scale-105 transition"
                >
                  <span className="font-semibold">Orders</span>
                  <MdShoppingCart className="text-2xl text-green-500" />
                </Link>

                <Link
                  to={`/user/addresses/${user._id}`}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:scale-105 transition"
                >
                  <span className="font-semibold">Addresses</span>
                  <MdLocationOn className="text-2xl text-green-500" />
                </Link>

                <Link
                  to="/help-support"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:scale-105 transition"
                >
                  <span className="font-semibold">Help & Support</span>
                  <MdHelp className="text-2xl text-green-500" />
                </Link>

                <Link
                  to="/terms"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:scale-105 transition"
                >
                  <span className="font-semibold">Terms & Conditions</span>
                  <MdDescription className="text-2xl text-green-500" />
                </Link>

                <Link
                  to="/policy"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:scale-105 transition"
                >
                  <span className="font-semibold">Privacy Policy</span>
                  <MdPolicy className="text-2xl text-green-500" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default UserProfile;
