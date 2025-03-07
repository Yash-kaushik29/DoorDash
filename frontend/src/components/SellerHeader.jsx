import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { RiAccountCircleLine } from "react-icons/ri";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";

const SellerHeader = ({ sellerId }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('doordashTheme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);
  

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('doordashTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('doordashTheme', 'light');
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-10 py-4 px-6 dark:bg-gray-900 dark:text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-green-500 text-xl">
              DoorDash
            </span>
            <MdDeliveryDining className="font-extrabold text-green-500 text-xl" />
          </div>
          <span className="italic text-gray-600 font-semibold dark:text-white">
            Delivery at your Doorstep
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-14 text-gray-700 dark:text-white">
          <ul className="flex space-x-8 ">
            <Link to="/seller">
              <li className="cursor-pointer font-semibold">
                DashBoard
              </li>
            </Link>
            <Link to="/seller/my-products">
              <li className="cursor-pointer font-semibold ">
                Products
              </li>
            </Link>
            <Link to="/seller/my-orders">
              <li className="cursor-pointer font-semibold ">
                Orders
              </li>
            </Link>
            <Link to="/seller/notifications">
              <li className="cursor-pointer font-semibold ">
                Notifications
              </li>
            </Link>
          </ul>
        </div>

        {/* Icons & Login */}
        <div className="hidden md:flex space-x-6 items-center text-2xl">
          <button onClick={toggleTheme} className="p-2 transition">
            {isDarkMode ? (
              <FaSun className="hover:text-yellow-400 " size={20} />
            ) : (
              <FaMoon className="hover:text-gray-500" size={20} />
            )}
          </button>
          {sellerId !== null ? (
            <Link to="/seller/profile">
              <RiAccountCircleLine className="cursor-pointer text-gray-700 dark:text-white" />
            </Link>
          ) : (
            <Link
              to="/seller/login"
              className="text-sm px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex gap-3 items-center">
        {sellerId !== null ? (
            <Link to="/seller/profile">
              <RiAccountCircleLine className="cursor-pointer text-gray-700 dark:text-white text-3xl" />
            </Link>
          ) : (
            <Link
              to="/seller/login"
              className="text-xl px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded transition"
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
        <div className="md:hidden bg-white dark:bg-gray-900 mt-2 rounded-lg">
          <ul className="flex flex-col items-center space-y-4 py-4">
            <Link to="/seller" onClick={toggleMobileMenu}>
              <li className="cursor-pointer font-semibold ">
                DashBoard
              </li>
            </Link>
            <Link to="/seller/my-products" onClick={toggleMobileMenu}>
              <li className="cursor-pointer font-semibold ">
                Products
              </li>
            </Link>
            <Link to="/seller/my-orders" onClick={toggleMobileMenu}>
              <li className="cursor-pointer font-semibold ">
                Orders
              </li>
            </Link>
            <Link to="/seller/notifications" onClick={toggleMobileMenu}>
              <li className="cursor-pointer font-semibold ">
                Notifications
              </li>
            </Link>
            <button onClick={toggleTheme} className="p-2 transition flex gap-2 items-center font-semibold">
            {isDarkMode ? (
              <FaSun className="hover:text-yellow-400 " size={20} />
            ) : (
              <FaMoon className="hover:text-gray-500" size={20} />
            )} Toggle Theme
          </button>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default SellerHeader;
