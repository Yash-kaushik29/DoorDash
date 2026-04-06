import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";

const OfflineScreen = () => {

  // Auto reload when back online
  useEffect(() => {
    const handleOnline = () => window.location.reload();
    window.addEventListener("online", handleOnline);

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6 
                    bg-gradient-to-br from-green-50 via-white to-green-100">

      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-green-100 p-6 rounded-full shadow-md"
      >
        <WifiOff size={50} className="text-green-600" />
      </motion.div>

      {/* Heading */}
      <h2 className="text-2xl font-bold mt-6 text-gray-800">
        You're Offline 🌐
      </h2>

      {/* Fun Text */}
      <p className="text-gray-500 mt-2 max-w-sm">
        Looks like your internet went on a chai break ☕  
        Come back online to continue ordering your favorites from GullyFoods!
      </p>

      {/* Retry Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (navigator.onLine) {
            window.location.reload();
          }
        }}
        className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 
                   text-white rounded-xl shadow-lg transition"
      >
        Try Again
      </motion.button>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-6">
        GullyFoods • Fresh • Fast • Local 🌿
      </p>
    </div>
  );
};

export default OfflineScreen;