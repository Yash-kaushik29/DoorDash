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
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);

    // Hide banner if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setShowBanner(false);
      return;
    }

    // Android install available
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS fallback (no install event)
    if (ios) {
      setTimeout(() => setShowBanner(true), 2000);
    }

    // Remove banner after install
    window.addEventListener("appinstalled", () => {
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!isIos && deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        toast.success("Installing GullyFoods 🚀");
        setShowBanner(false);
      } else {
        toast.info("Installation cancelled");
      }

      setDeferredPrompt(null);
      return;
    }

    if (isIos) {
      toast.info(
        "On iPhone: Tap the Share icon in Safari → 'Add to Home Screen'",
        { autoClose: 5000 }
      );
      return;
    }

    toast.error("Installation not supported in this browser");
  };

  if (!showBanner) return null;

  const canInstall = !isIos && Boolean(deferredPrompt);

  return (
    <>
      <div className="w-full bg-green-500 text-white px-4 py-3 rounded-b-lg shadow-lg animate-slide-down">
        <div className="flex items-center justify-between gap-3">
          
          {/* App Icon + Text */}
          <div className="flex items-center gap-3">
            <img
              src="/icons/gullyfoodsLogo192.png"
              alt="GullyFoods Icon"
              className="w-9 h-9 rounded-lg shadow bg-white"
            />
            <span className="font-medium text-sm sm:text-base">
              Add app to your <span className="font-bold">home screen</span>
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              disabled={!canInstall && !isIos}
              className="flex items-center gap-1 bg-white text-green-600 font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <MdDownload className="text-lg" />
              {isIos ? "How" : "Add"}
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
          Trouble installing?{" "}
          <Link
            to="/install-guide"
            className="underline font-semibold hover:text-gray-200"
          >
            See guide
          </Link>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default InstallPrompt;
