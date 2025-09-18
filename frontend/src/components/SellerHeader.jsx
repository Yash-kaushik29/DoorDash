import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import { RiAccountCircleLine } from "react-icons/ri";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { GiNoodles } from "react-icons/gi";

const SellerHeader = ({ sellerId }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const token = localStorage.getItem("doordash-seller");

  useEffect(() => {
    const storedTheme = localStorage.getItem("doordashTheme");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    }
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("doordashTheme", newMode ? "dark" : "light");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow sticky top-0 z-20">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3 md:py-4">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
            Gully<span className="text-green-500">Foods</span>
            <GiNoodles className="text-green-500" />
          </div>
          <span className="text-xs italic text-gray-600 dark:text-gray-300">
            Your lane, your taste, Your GullyFoods ✨
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-gray-700 dark:text-white">
          <Link to="/seller" className="font-semibold hover:text-green-500 transition">
            Dashboard
          </Link>
          <Link to="/seller/my-products" className="font-semibold hover:text-green-500 transition">
            Products
          </Link>
          <Link to="/seller/my-orders" className="font-semibold hover:text-green-500 transition">
            Orders
          </Link>
          <Link to="/seller/notifications" className="font-semibold hover:text-green-500 transition">
            Notifications
          </Link>
        </div>

        {/* Right Icons */}
        <div className="hidden md:flex items-center space-x-4 text-2xl">
          <button onClick={toggleTheme} className="p-1 transition hover:scale-110">
            {isDarkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
          </button>
          {token ? (
            <Link to="/seller/profile">
              <RiAccountCircleLine className="cursor-pointer text-gray-700 dark:text-white text-2xl" />
            </Link>
          ) : (
            <Link
              to="/seller/login"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-md text-sm hover:opacity-90 transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {token ? (
            <Link to="/seller/profile">
              <RiAccountCircleLine className="text-gray-700 dark:text-white text-3xl" />
            </Link>
          ) : (
            <Link
              to="/seller/login"
              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-md text-sm"
            >
              Login
            </Link>
          )}
          <button onClick={toggleMobileMenu} className="text-3xl">
            {isMobileMenuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg rounded-b-lg py-4">
          <ul className="flex flex-col items-center space-y-3 text-gray-700 dark:text-white">
            <Link to="/seller" onClick={toggleMobileMenu}>
              <li className="font-semibold hover:text-green-500 transition">Dashboard</li>
            </Link>
            <Link to="/seller/my-products" onClick={toggleMobileMenu}>
              <li className="font-semibold hover:text-green-500 transition">Products</li>
            </Link>
            <Link to="/seller/my-orders" onClick={toggleMobileMenu}>
              <li className="font-semibold hover:text-green-500 transition">Orders</li>
            </Link>
            <Link to="/seller/notifications" onClick={toggleMobileMenu}>
              <li className="font-semibold hover:text-green-500 transition">Notifications</li>
            </Link>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 font-semibold bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />} Toggle Theme
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default SellerHeader;
