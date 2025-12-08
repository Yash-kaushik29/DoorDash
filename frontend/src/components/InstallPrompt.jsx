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

    // Hide if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setShowBanner(false);
      return;
    }

    const handler = (e) => {
      console.log("beforeinstallprompt fired ✅");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS only: there is no beforeinstallprompt, show banner with guide
    if (ios) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    // ANDROID / DESKTOP CHROME
    if (!isIos && deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        toast.success("Installing your app! Enjoy 😀");
        setShowBanner(false);
      } else {
        toast.info("You dismissed the install prompt.");
      }

      setDeferredPrompt(null);
      return;
    }

    // iOS – no real install prompt, send them to the guide instead
    if (isIos) {
      toast.info(
        "On iPhone, tap the Share icon in Safari and choose 'Add to Home Screen' 😊",
        { autoClose: 5000 }
      );
      return;
    }

    // Fallback – should rarely happen now
    toast.error("Installation is not available in this browser.", {
      autoClose: 3000,
    });
  };

  if (!showBanner) return null;

  const canInstall = !isIos && !!deferredPrompt;

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
              disabled={!canInstall && !isIos}
              className={`flex items-center gap-1 bg-white text-green-600 font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <MdDownload className="text-lg" />
              {isIos ? "How to install" : "Install"}
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

      <ToastContainer />
    </>
  );
};

export default InstallPrompt;
