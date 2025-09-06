import React, { useEffect, useState } from "react";
import { MdDownload } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Detect if running in standalone mode → hide banner
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowBanner(false);
      return;
    }

    // Always show banner on web
    setShowBanner(true);

    // Save install prompt event if available
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: manual instructions
      alert(
        "To install GullyFoods, open your browser menu and choose 'Add to Home Screen'."
      );
    }
  };

  if (!showBanner) return null;

  return (
    <div className="w-full bg-green-500 text-white px-4 py-3 flex items-center justify-between gap-3 rounded-b-lg">
      <span className="font-medium text-sm sm:text-base">
        📱 Install <span className="font-bold">GullyFoods</span> for 1-tap access
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="flex items-center gap-1 bg-white text-green-600 font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition"
        >
          <MdDownload className="text-lg" />
          Install
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="bg-transparent text-white hover:bg-green-600 p-1.5 rounded-lg transition"
        >
          <IoClose className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
