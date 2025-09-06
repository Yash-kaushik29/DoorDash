import React from 'react'

const OrderDetailsLoader = () => {
  return (
    <div className="mb-16 lg:mb-0">
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-2 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-4 space-y-6 animate-pulse">
          {/* Title */}
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>

          {/* Status row */}
          <div className="flex justify-between space-x-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          </div>

          {/* Shipping Address */}
          <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 space-y-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex justify-between items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 ml-auto"></div>
        </div>
      </div>
    </div>
  );
};


export default OrderDetailsLoader