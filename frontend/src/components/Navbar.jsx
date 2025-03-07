import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosCart, IoIosHeart } from "react-icons/io";
import { RiAccountCircleLine } from "react-icons/ri";
import { FaSun, FaMoon, FaHistory, FaHome } from "react-icons/fa";
import { UserContext } from "../context/userContext";
import { MdDeliveryDining } from "react-icons/md";
import "react-loading-skeleton/dist/skeleton.css";

const Navbar = () => {
  const { user, ready } = useContext(UserContext);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("doordashTheme");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    }
  }, [user]);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);

    if (newIsDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("doordashTheme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("doordashTheme", "light");
    }
  };

  return (
    <div className="relative">
      {/* Desktop Navbar */}
      <header className="hidden lg:flex shadow-lg dark:bg-gray-900 bg-white fixed top-0 left-0 w-full h-16 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between h-full">
          {/* Brand Logo */}
          <Link to="/">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-green-500 text-xl">
                  DoorDash
                </span>
              </div>
              <span className="italic text-gray-600 font-semibold dark:text-white">
                Delivery at your Doorstep
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/recentOrders">
              <button className="p-2 hover:text-green-600 transition">
                <FaHistory size={20} />
              </button>
            </Link>
            <Link to="/cart">
              <button className="p-2 hover:text-green-500 transition">
                <IoIosCart size={22} />
              </button>
            </Link>
            <button onClick={toggleTheme} className="p-2 transition">
              {isDarkMode ? (
                <FaSun className="hover:text-yellow-400" size={20} />
              ) : (
                <FaMoon className="hover:text-gray-500" size={20} />
              )}
            </button>
            {user ? (
              <Link to="/user/profile" className="p-2 transition">
                <RiAccountCircleLine size={24} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-green-400 text-white font-semibold rounded-full hover:bg-green-500 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Push content down to avoid overlap */}
      <main className="lg:pt-16">{/* Your page content goes here */}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md flex justify-around py-1 border-t dark:border-gray-700 z-10">
        <Link
          to="/"
          className="p-2 flex flex-col items-center text-gray-600 dark:text-white hover:text-red-600 transition"
        >
          <FaHome size={22} />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/recentOrders"
          className="p-2 flex flex-col items-center text-gray-600 dark:text-white hover:text-red-600 transition"
        >
          <FaHistory size={22} />
          <span className="text-xs">Orders</span>
        </Link>
        <Link
          to="/cart"
          className="p-2 flex flex-col items-center text-gray-600 dark:text-white hover:text-green-500 transition"
        >
          <IoIosCart size={22} />
          <span className="text-xs">Cart</span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 flex flex-col items-center text-gray-600 dark:text-white hover:text-yellow-400 transition"
        >
          {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          <span className="text-xs">Theme</span>
        </button>
        {user ? (
          <Link
            to="/user/profile"
            className="p-2 flex flex-col items-center text-gray-600 dark:text-white hover:text-blue-500 transition"
          >
            <RiAccountCircleLine size={22} />
            <span className="text-xs">Profile</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="p-2 flex flex-col items-center text-gray-600 dark:text-white hover:text-green-500 transition"
          >
            <RiAccountCircleLine size={22} />
            <span className="text-xs">Login</span>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
