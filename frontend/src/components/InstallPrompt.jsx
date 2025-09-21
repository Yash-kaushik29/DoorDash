import React, { useEffect, useState } from "react";
import { MdDownload } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setShowBanner(false);
      return;
    }

    setShowBanner(true);

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
    if (!isIos && deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="w-full bg-green-500 text-white px-4 py-3 rounded-b-lg shadow-lg">
      <div className="flex items-center justify-between gap-3">
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

      <div className="mt-2 text-xs sm:text-sm text-white opacity-90">
        Facing problems installing?{" "}
        <Link
          to="/install-guide"
          className="underline font-semibold hover:text-gray-200"
        >
          Check this guide!
        </Link>
      </div>
    </div>
  );
};

export default InstallPrompt;
