import { Menu, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const DeliveryBoyHeader = () => {
     const [isDarkMode, setIsDarkMode] = useState(false);
     const [isMenuOpen, setIsMenuOpen] = useState(false);
    
      useEffect(() => {
        const storedTheme = localStorage.getItem('doordashTheme');
        if (storedTheme) {
          setIsDarkMode(storedTheme === 'dark');
          document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        }
      }, []);
      
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

      const handleLogout = () => {
        localStorage.setItem("token", "");
      }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md p-4">
      <div className="flex justify-between items-center">
        {/* Logo / Title */}
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
          Delivery Dashboard
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4">
          <button
            onClick={toggleTheme}
            className="bg-blue-500 text-white px-4 py-2 rounded-2xl text-sm sm:text-base"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button 
          onClick={handleLogout}
           className="bg-blue-500 text-white px-4 py-2 rounded-2xl text-sm sm:text-base">
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-800 dark:text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="flex flex-col items-start gap-2 mt-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="bg-blue-500 text-white px-4 py-2 rounded-2xl w-full text-left"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={handleLogout} className="bg-blue-500 text-white px-4 py-2 rounded-2xl w-full text-left">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default DeliveryBoyHeader