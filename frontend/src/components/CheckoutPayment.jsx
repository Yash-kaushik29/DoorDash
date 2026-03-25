import React from "react";
import { toast } from "react-toastify";

const CheckoutPayment = ({
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  selectedAddress,
  totalAmount, 
}) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleClick = () => {
    if (!selectedAddress) return;

    if (paymentMethod === "COD") {
      setShowConfirm(true);
    } else {
      handleCheckout();
    }
  };

  return (
    <>
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
            onClick={() =>
              toast.warn(
                "Razorpay is facing payment failures. Please proceed with COD."
              )
            }
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

        <button
          onClick={handleClick}
          disabled={!selectedAddress}
          className={`w-full py-3 mt-2 rounded-xl font-bold text-lg transition 
            ${
              selectedAddress
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 cursor-not-allowed text-gray-600"
            }
          `}
        >
          {!selectedAddress
            ? "Please Select an address"
            : paymentMethod === "Razorpay"
            ? "Proceed to Pay 💳"
            : "Place Order 🎉"}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              Confirm Order
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your order total is{" "}
              <span className="font-semibold">₹{totalAmount}</span>.
              <br />
              Do you want to place the order?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 dark: text-gray-800"
              >
                Go Back
              </button>

              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleCheckout();
                }}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPayment;