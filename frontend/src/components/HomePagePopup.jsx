import React, { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePagePopup = () => {
  const [visible, setVisible] = useState(true);
  const [countdown, setCountdown] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, [visible]);

  const getNextSaturdayMidnight = () => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7 || 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + daysUntilSaturday);
    saturday.setHours(0, 0, 0, 0);
    return saturday;
  };

  useEffect(() => {
    const target = getNextSaturdayMidnight();
    const updateCountdown = () => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown("🎉 LIVE NOW!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  if(!visible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="relative bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-6 max-w-sm w-[90%] text-center border border-green-300"
        >
          <button
            onClick={() => {
              setVisible(false);
            }}
            className="absolute top-3 right-3 text-gray-500 hover:text-green-600 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <DotLottieReact
            src="/lottie/sale.lottie"
            loop
            autoplay
            className="w-44 h-44 mx-auto"
          />

          <h3 className="text-2xl font-extrabold text-green-500 mt-2">
            🎪 Gully<span className="text-black dark:text-gray-100">Foods</span> Flavor Carnival
          </h3>

          <p className="italic text-black dark:text-gray-200 text-sm mt-1">
            “Swaad ka Tadka, Jeb par Halka.”
          </p>

          <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p className="font-semibold text-green-600 text-lg">
              🔥 Exciting Discounts on All Restaurants
            </p>
            <p>🍔 Food • 🛒 Grocery • 🧃 Everything</p>
            <p className="text-green-500 font-medium">This Saturday & Sunday !</p>
          </div>

          <div className="mt-4 bg-green-700 text-green-200 rounded-lg p-3 shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white">
              Discounts Goes Live In
            </p>
            <p className="text-lg font-bold text-white mt-1">
              {countdown || "Loading..."}
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.setItem("popupSeen", "true");
              setVisible(false);
              navigate("/products/restaurants");
            }}
            className="mt-5 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition w-full"
          >
            Explore Now
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HomePagePopup;
