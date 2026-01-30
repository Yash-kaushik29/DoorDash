import React from "react";

const BASE_STAGES = [
  "Processing",
  "Preparing",
  "Out For Delivery",
  "Delivered",
];

const CANCELLED_STAGES = ["Processing", "Cancelled"];

const unifiedStatusStyles = {
  Processing: {
    active: "bg-blue-500",
    text: "text-blue-500",
    muted: "bg-gray-300 dark:bg-gray-600",
  },
  Preparing: {
    active: "bg-yellow-500",
    text: "text-yellow-500",
    muted: "bg-gray-300 dark:bg-gray-600",
  },
  "Out For Delivery": {
    active: "bg-indigo-500",
    text: "text-indigo-500",
    muted: "bg-gray-300 dark:bg-gray-600",
  },
  Delivered: {
    active: "bg-green-500",
    text: "text-green-500",
    muted: "bg-gray-300 dark:bg-gray-600",
  },
  Cancelled: {
    active: "bg-red-500",
    text: "text-red-500",
    muted: "bg-gray-300 dark:bg-gray-600",
  },
};

const DeliveryTimeline = ({ currentStatus }) => {
  const isCancelled = currentStatus === "Cancelled";

  const stages = isCancelled ? CANCELLED_STAGES : BASE_STAGES;
  const currentIndex = stages.indexOf(currentStatus);

  const style =
    unifiedStatusStyles[currentStatus] || unifiedStatusStyles.Processing;

  return (
    <div className="w-full mt-2">
      <div className="relative flex items-start justify-between">
        {stages.map((stage, index) => {
          const isActiveOrPast = index <= currentIndex;

          return (
            <div
              key={stage}
              className="relative flex flex-col items-center flex-1"
            >
              {/* CONNECTING LINE */}
              {index !== 0 && (
                <div
                  className={`absolute top-3 left-0 w-full h-1 -translate-x-1/2 ${
                    isActiveOrPast ? style.active : style.muted
                  }`}
                />
              )}

              {/* DOT */}
              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                  isActiveOrPast ? style.active : style.muted
                }`}
              >
                {isActiveOrPast && (
                  <span className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>

              {/* LABEL */}
              <span
                className={`mt-2 text-xs text-center whitespace-nowrap ${
                  isActiveOrPast ? style.text : "text-gray-400"
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryTimeline;
