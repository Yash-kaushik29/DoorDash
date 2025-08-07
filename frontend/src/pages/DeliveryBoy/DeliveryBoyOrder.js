import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";

const DeliveryBoyOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
        { withCredentials: true }
      );
      alert("Order marked as Delivered");
      window.location.reload();
    } catch (error) {
      console.error("Error confirming delivery:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <div>
      <DeliveryBoyHeader />
      <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Order Details
        </h1>

        {/* Order Details Section */}
        <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Order Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h1 className="font-bold">
              Order ID:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                #{order.id}
              </span>
            </h1>
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Payment Status:</span>{" "}
                <span
                  className={`${
                    order?.paymentStatus === "Unpaid"
                      ? "text-red-400"
                      : "text-green-600"
                  } font-semibold`}
                >
                  {order?.paymentStatus}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
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
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Amount: </span>
                <span className="font-semibold text-green-600">
                  ₹{order.amount}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Customer Name:</span>{" "}
                {order?.shippingAddress?.fullName}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Phone:</span>{" "}
                {order?.shippingAddress?.phone}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Address:</span>{" "}
                {order?.shippingAddress?.addressLine},
                <span className="font-semibold">
                  {" "}
                  {order?.shippingAddress?.area}
                </span>
                <span className="font-semibold">
                  {" "}
                  {order?.shippingAddress?.landMark}
                </span>
              </p>

              {order?.shippingAddress?.lat && order?.shippingAddress?.long && (
                <a
                  href={`https://www.google.com/maps?q=${order.shippingAddress.lat},${order.shippingAddress.long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition duration-200"
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
              className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
                {item.product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Shop:</span>{" "}
                {item.product.shopName}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Quantity:</span> {item.quantity}
              </p>
              <p
                className={`font-semibold ${
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
              {(item.status === "Preparing" ||
                item.status === "Processing") && (
                <button
                  onClick={() => markAsOutForDelivery(item.product._id)}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Mark as Out For Delivery
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={confirmDelivery}
          className="mt-8 w-full md:w-auto px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Confirm Order Delivered
        </button>
      </div>
    </div>
  );
};

export default DeliveryBoyOrder;
