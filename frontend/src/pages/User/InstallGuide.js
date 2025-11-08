import React, { useState } from "react";
import { FaApple } from "react-icons/fa";
import { MdOutlineLaptopMac, MdOutlineLaptop } from "react-icons/md";
import { FcAndroidOs } from "react-icons/fc";
import Navbar from "../../components/Navbar";

const InstallGuide = () => {
  const [activeTab, setActiveTab] = useState("android");

  const tabs = [
    { id: "android", label: "Android" },
    { id: "ios", label: "iOS" },
    { id: "desktop", label: "Desktop" },
  ];

  const tabContent = {
    android: (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
          🤖 Add <span className="text-green-600">GullyFoods</span> to Your
          Android Home Screen
        </h3>

        {/* Step 1 */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Step 1️⃣ — Open GullyFoods in Chrome
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Open <strong>Chrome</strong> (or any supported browser) on your
            phone and visit{" "}
            <a
              href="https://www.gullyfoods.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500"
            >
              www.gullyfoods.app
            </a>
            .
          </p>
          <div className="mt-3 flex justify-center">
            <img
              src="/setupGuide/androidstep1.jpg"
              alt="Open GullyFoods in Chrome"
              className="rounded-lg w-40 sm:w-56 shadow-md border border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Step 2️⃣ — Tap the Menu Icon
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tap the <strong>three vertical dots</strong> in the top-right corner
            of Chrome to open the browser menu.
          </p>
          <div className="mt-3 flex justify-center">
            <img
              src="/setupGuide/androidstep2.jpg"
              alt="Open Chrome Menu"
              className="rounded-lg w-40 sm:w-56 shadow-md border border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-green-50 dark:bg-green-900 p-5 rounded-xl border border-green-400 shadow-sm">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Step 3️⃣ — Select “Add to Home Screen” 🎉
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            From the menu, tap <strong>Add to Home Screen</strong>. Confirm by
            tapping <strong>Add</strong>, and GullyFoods will appear on your
            home screen like a native app!
          </p>
          <div className="mt-3 flex justify-center">
            <img
              src="/setupGuide/androidstep3.jpg"
              alt="Add to Home Screen"
              className="rounded-lg w-40 sm:w-56 shadow-md border border-green-400 dark:border-green-600"
            />
          </div>
        </div>
      </div>
    ),
    ios: (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
          📱 Add <span className="text-green-600">GullyFoods</span> to Your
          iPhone Home Screen
        </h3>

        {/* Step 1 */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Step 1️⃣ — Open GullyFoods in Safari
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Open <strong>Safari</strong> and visit{" "}
            <a
              href="www.gullyfoods.app"
              target="_blank"
              className="underline text-blue-500"
            >
              www.gullyfoods.app
            </a>
            .
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Step 2️⃣ — Tap the Share Icon
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tap the <strong>Share</strong> button — it’s the{" "}
            <strong>square with an upward arrow</strong> at the bottom of the
            screen.
          </p>
          <div className="mt-3 flex justify-center">
            <img
              src="/setupGuide/iosstep1.jpg"
              alt="Tap Share Button"
              className="rounded-lg w-40 sm:w-56 shadow-md border border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Step 3️⃣ — Select “Add to Home Screen”
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Scroll through the options and choose{" "}
            <strong>Add to Home Screen</strong>. You’ll see a preview of the
            icon and name.
          </p>
          <div className="mt-3 flex justify-center">
            <img
              src="/setupGuide/iosstep2.jpg"
              alt="Add to Home Screen Option"
              className="rounded-lg w-40 sm:w-56 shadow-md border border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-green-50 dark:bg-green-900 p-5 rounded-xl border border-green-400 shadow-sm">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Step 4️⃣ — Confirm and Done 🎉
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Tap <strong>Add</strong> in the top-right corner. GullyFoods will
            now appear on your home screen like a regular app.
          </p>
          <div className="mt-3 flex justify-center">
            <img
              src="/setupGuide/iosstep3.jpg"
              alt="Added to Home Screen"
              className="rounded-lg w-40 sm:w-56 shadow-md border border-green-400 dark:border-green-600"
            />
          </div>
        </div>
      </div>
    ),
    desktop: (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
          💻 Install <span className="text-green-600">GullyFoods</span> on Your
          Computer
        </h3>

        {/* Steps List */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              Open <strong>Chrome</strong>, <strong>Edge</strong>, or{" "}
              <strong>Firefox</strong> and go to{" "}
              <a
                href="https://www.gullyfoods.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-500"
              >
                www.gullyfoods.app
              </a>
              .
            </li>

            <li>
              Click the <strong>install icon</strong> (📥) in the address bar,
              or open the browser menu → <em>Install App</em>.
            </li>

            <li>
              Confirm the installation — GullyFoods will now appear as a desktop
              app! 🎉
            </li>
          </ol>

          {/* Preview Image */}
          <div className="mt-5 flex justify-center">
            <img
              src="/setupGuide/webstep1.jpg"
              alt="Install GullyFoods on desktop"
              className="rounded-lg w-full shadow-md border border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>
      </div>
    ),
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 flex flex-col items-center bg-gray-50 dark:bg-gray-900 pb-28 lg:pb-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-green-600 text-center">
          🚀 Install GullyFoods Like a Pro!
        </h1>
        <p className="text-center mb-6 max-w-xl text-gray-700 dark:text-gray-300">
          Having trouble installing? No worries! Select your device below to see
          detailed instructions.
        </p>

        {/* Tabs */}
        <div className="w-full max-w-xl mb-6">
          <div className="flex border-b border-gray-300 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-center font-semibold transition ${
                  activeTab === tab.id
                    ? "border-b-4 border-green-500 text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
                }`}
              >
                {tab.id === "android" && <FcAndroidOs size={20} />}
                {tab.id === "ios" && <FaApple size={20} />}
                {tab.id === "desktop" && <MdOutlineLaptopMac size={20} />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          {tabContent[activeTab]}
        </div>
      </div>
    </>
  );
};

export default InstallGuide;
