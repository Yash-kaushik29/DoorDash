import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";

const DeliveryBoyOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false); // 🔹 new
  const navigate = useNavigate();
  const token = localStorage.getItem("GullyFoodsDeliveryToken");

  if (!token) {
    navigate("/delivery/login");
  }

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/delivery/order/${orderId}`,
          { withCredentials: true }
        );
        setOrder(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const markAsOutForDelivery = async (productId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/delivery/order/confirm-pickup`,
        { orderId, productId },
        { withCredentials: true }
      );
      alert("Marked as Out For Delivery");
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const confirmDelivery = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/delivery/order/confirm-delivery/${orderId}`,
        {},
        { withCredentials: true }
      );

      alert("Order marked as Delivered");
      setOrder({ ...order, deliveryStatus: "Delivered" }); // 🔹 update local state
      setShowConfirm(false); // close modal
    } catch (error) {
      console.error("Error confirming delivery:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div>
      <DeliveryBoyHeader />
      <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Order Details
        </h1>

        {/* Order Details Section */}
        <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Order Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700 dark:text-gray-200">
                <span className="font-semibold">Order ID:</span>{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  #{order.id}
                </span>
              </p>

              <p className="text-gray-700 dark:text-gray-200 mt-2">
                <span className="font-semibold">Payment Status:</span>{" "}
                <span
                  className={`font-bold ${
                    order?.paymentStatus === "Unpaid"
                      ? "text-red-500"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {order?.paymentStatus}
                </span>
              </p>

              <p className="text-gray-700 dark:text-gray-200 mt-2">
                <span className="font-semibold">Delivery Status:</span>{" "}
                <span
                  className={`font-bold ${
                    order?.deliveryStatus === "Delivered"
                      ? "text-green-600 dark:text-green-400"
                      : order?.deliveryStatus === "Out For Delivery"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : order?.deliveryStatus === "Processing"
                      ? "text-blue-600 dark:text-blue-400"
                      : order?.deliveryStatus === "Cancelled"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {order?.deliveryStatus}
                </span>
              </p>

              <p className="text-gray-700 dark:text-gray-200 mt-2">
                <span className="font-semibold">Amount:</span>{" "}
                <span className="font-semibold text-green-600">
                  ₹
                  {order?.amount +
                    order?.taxes +
                    order?.convenienceFees +
                    order?.deliveryCharge}
                </span>
              </p>
            </div>

            <div>
              <p className="text-gray-700 dark:text-gray-200">
                <span className="font-semibold">Customer Name:</span>{" "}
                {order?.shippingAddress?.fullName}
              </p>
              <p className="text-gray-700 dark:text-gray-200 mt-2">
                <span className="font-semibold">Phone:</span>{" "}
                {order?.shippingAddress?.phone}
              </p>
              <p className="text-gray-700 dark:text-gray-200 mt-2">
                <span className="font-semibold">Address:</span>{" "}
                {order?.shippingAddress?.addressLine},{" "}
                {order?.shippingAddress?.area},{" "}
                {order?.shippingAddress?.landMark}
              </p>

              {order?.shippingAddress?.lat && order?.shippingAddress?.long && (
                <a
                  href={`https://www.google.com/maps?q=${order.shippingAddress.lat},${order.shippingAddress.long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
                >
                  📍 View on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Product List Section */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {order?.items.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  {item.product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Shop:</span>{" "}
                  {item.product.shopName}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Quantity:</span>{" "}
                  {item.quantity}
                </p>

                <p
                  className={`mt-2 font-semibold ${
                    item.status === "Processing"
                      ? "text-blue-600 dark:text-blue-400"
                      : item.status === "Out For Delivery" ||
                        item.status === "Preparing"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : item.status === "Delivered"
                      ? "text-green-600 dark:text-green-400"
                      : item.status === "Cancelled"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Status: {item.status}
                </p>
              </div>

              {/* Show button only when product is still active */}
              {(item.status === "Preparing" ||
                item.status === "Processing") && (
                <button
                  onClick={() => markAsOutForDelivery(item.product._id)}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Mark as Out For Delivery
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ✅ Show button only if not delivered */}
        {order?.deliveryStatus !== "Delivered" &&
          order.deliveryStatus !== "Cancelled" && (
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-8 w-full md:w-auto px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Confirm Order Delivered
            </button>
          )}

        {/* ✅ Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Confirm Delivery
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to mark this order as delivered? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelivery}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoyOrder;
