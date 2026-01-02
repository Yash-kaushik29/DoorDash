import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PLACEHOLDERS = [
  "Cakes 🎂",
  "pizza 🍕",
  "Shampoo 🧴",
  "Coffee ☕",
  "Toothpaste 🦷",
  "Burger combo 🍔",
  "Chaap 🍠",
  "Biscuit 🍪",
  "Biryani 🍛",
  "🏍️💨💨"
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setFade(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [query]);

  const handleSearch = () => {
    if (query.trim() === "") {
      toast.error("Please enter a valid key!");
    } else {
      navigate(`/search/${query.toLowerCase()}`);
    }
  };

  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e) => {
      const result = e.results[0][0].transcript;
      setQuery(result);
      navigate(`/search/${result.toLowerCase()}`);
    };

    recognition.onend = () => setIsListening(false);
  };

  return (
    <div className="relative flex flex-col items-center pt-5 space-y-3 w-full">
      <div className="relative flex items-center w-full max-w-[320px]">
        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full px-11 py-3 rounded-full border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-red-500
          shadow-md transition text-gray-800 bg-white"
        />

        {/* Animated Placeholder */}
        {!query && (
          <span
            className={`pointer-events-none absolute left-11
            text-gray-400 transition-all duration-300
            ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
          >
            {PLACEHOLDERS[placeholderIndex]}
          </span>
        )}

        {/* Voice Button */}
        <button
          onClick={startVoiceSearch}
          className="absolute left-4 text-gray-500 hover:text-red-500 transition"
        >
          <FaMicrophone size={18} />
        </button>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="absolute right-4 text-gray-500 hover:text-red-500 transition"
        >
          <IoIosSearch size={22} />
        </button>
      </div>

      {isListening && (
        <span className="text-red-500 text-sm font-semibold animate-pulse">
          🎙 Listening...
        </span>
      )}
    </div>
  );
};

export default SearchBar;
