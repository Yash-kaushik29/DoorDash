import React from "react";
import { toast } from "react-toastify";

const CheckoutPayment = ({
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  selectedAddress,
}) => {
  return (
    <div className="space-y-3 mb-6">
      <label className="font-semibold text-gray-800 dark:text-gray-100">
        Select Payment Method 💳:
      </label>
      <div className="flex space-x-4">
        <button
          onClick={() => setPaymentMethod("COD")}
          className={`p-3 w-1/2 rounded-xl font-semibold transition transform hover:scale-105
            ${
              paymentMethod === "COD"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-500"
            }`}
        >
          Cash on Delivery
        </button>
        <button
          // onClick={() => setPaymentMethod("Razorpay")}
          onClick={() => toast.warn("Razorpay is facing payment failures. Please proceed with COD.")}
          className={`p-3 w-1/2 rounded-xl font-semibold transition transform hover:scale-105
            ${
              paymentMethod === "Razorpay"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-500"
            }`}
        >
          Pay with Razorpay
        </button>
      </div>

      {/* <button
        onClick={handleCheckout}
        disabled={!selectedAddress}
        className={`w-full py-3 mt-2 rounded-xl font-bold text-lg transition 
          ${
            selectedAddress
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-300 cursor-not-allowed text-gray-600"
          }
        `}
      >
        {paymentMethod === "Razorpay" ? "Proceed to Pay 💳" : "Place Order 🎉"}
      </button> */}
      <div className="py-3 mt-2 font-bold" >Order will start from 03 November, 2025. Explore our menu.</div>
    </div>
  );
};

export default CheckoutPayment;
