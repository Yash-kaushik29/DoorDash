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
      <div className="space-y-4">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Open <strong>Chrome</strong> (or supported browser) on your phone.
          </li>
          <li>Go to the <strong>GullyFoods</strong> website.</li>
          <li>
            Look for the <strong>“Install App”</strong> banner OR tap the browser menu →{" "}
            <em>Add to Home Screen</em>.
          </li>
          <li>Tap <strong>Add</strong> and voilà! 🎉</li>
        </ol>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-md h-40 flex items-center justify-center text-gray-500 dark:text-gray-300">
          [Android screenshot placeholder]
        </div>
      </div>
    ),
    ios: (
      <div className="space-y-4">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Open <strong>Safari</strong> and go to <strong>GullyFoods</strong>.
          </li>
          <li>Tap the <strong>Share</strong> button (square with arrow up).</li>
          <li>Scroll and select <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong> in the top-right corner. Done! 🎉</li>
        </ol>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-md h-40 flex items-center justify-center text-gray-500 dark:text-gray-300">
          [iOS screenshot placeholder]
        </div>
      </div>
    ),
    desktop: (
      <div className="space-y-4">
        <ol className="list-decimal list-inside space-y-2">
          <li>Open Chrome, Edge, or Firefox and go to <strong>GullyFoods</strong>.</li>
          <li>Click the <strong>install icon</strong> in the address bar or open menu → <em>Install App</em>.</li>
          <li>Confirm and enjoy the desktop shortcut! 🎉</li>
        </ol>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-md h-40 flex items-center justify-center text-gray-500 dark:text-gray-300">
          [Desktop screenshot placeholder]
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
          Having trouble installing? No worries! Select your device below to see detailed instructions.
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
