import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';

const AdminHeader = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedTheme = localStorage.getItem("doordashTheme");
        if (storedTheme) {
          setIsDarkMode(storedTheme === "dark");
          document.documentElement.classList.toggle("dark", storedTheme === "dark");
        }
      }, []);

      const handleLogout = async () => {
        try {
          await api.post(`/api/admin/logout`, {}, { withCredentials: true });
          navigate('/admin/login');
        } catch (error) {
          console.error('Logout failed:', error);
        }
      };
    
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
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={toggleTheme}
            className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 dark:bg-red-700 text-white px-4 py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default AdminHeader