import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState(""); 
  const [isListening, setIsListening] = useState(false); 
  const navigate = useNavigate();

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
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setQuery(result);
      handleSearch(); // auto trigger search after voice input
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="relative flex flex-col items-center pt-5 space-y-4">
      {/* Search Input Field */}
      <div className="relative flex items-center w-full max-w-[300px]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full px-10 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md transition duration-200 ease-in-out text-gray-700"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />

        <button
          onClick={startVoiceSearch}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-500 transition duration-200"
        >
          <FaMicrophone size={24} />
        </button>
        
        <button
          onClick={handleSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-500 transition duration-200"
        >
          <IoIosSearch size={24} />
        </button>
      </div>

      {isListening && (
        <span className="text-green-500 text-sm font-semibold mt-2">
          🗣️ Listening...
        </span>
      )}
    </div>
  );
};

export default SearchBar;
