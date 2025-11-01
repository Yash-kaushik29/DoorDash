import React, { useEffect, useState } from "react";
import { MdDownload } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

    // Hide if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setShowBanner(false);
      return;
    }

    // Listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If it never fires (e.g. iOS or blocked), show banner anyway
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt) setShowBanner(true);
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!isIos && deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      toast.error("Couldn’t install the app. Try refreshing the page.", {
        autoClose: 3000,
      });
    }
  };

  if (!showBanner) return null;

  return (
    <>
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

        <div className="mt-2 text-white opacity-90">
          Facing problems installing?{" "}
          <Link
            to="/install-guide"
            className="underline font-semibold hover:text-gray-200"
          >
            Check this guide!
          </Link>
        </div>
      </div>

      {/* Toast container — must be outside the banner */}
      <ToastContainer />
    </>
  );
};

export default InstallPrompt;
