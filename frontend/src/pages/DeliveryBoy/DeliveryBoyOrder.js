import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaMoneyBillWave,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import { IoFastFoodSharp } from "react-icons/io5";
import { MdDeliveryDining } from "react-icons/md";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";
import api from "../../utils/axiosInstance";

const DeliveryBoyOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("GullyFoodsDeliveryToken");

  if (!token) {
    navigate("/delivery/login");
  }

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/api/delivery/order/${orderId}`, {
          withCredentials: true,
        });
        setOrder(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const markAsOutForDelivery = async () => {
    try {
      await api.put(
        `/api/delivery/order/confirm-pickup`,
        { orderId },
        { withCredentials: true }
      );
      toast.success("Order marked as Out For Delivery ✅");
      setOrder({ ...order, deliveryStatus: "Out For Delivery" });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const confirmDelivery = async () => {
    try {
      await api.put(
        `/api/delivery/order/confirm-delivery/${orderId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Order marked as Delivered 🎉");
      setOrder({
        ...order,
        deliveryStatus: "Delivered",
        paymentStatus: "Paid",
      });
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error("Failed to confirm delivery");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div>
      <DeliveryBoyHeader />
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Order Details
        </h1>

        {/* Order Info Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <IoFastFoodSharp className="text-green-500" /> Order Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <MdDeliveryDining className="text-blue-500" />
                <span className="font-semibold">Order ID:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  #{order.id}
                </span>
              </p>

              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaMoneyBillWave className="text-green-500" />
                <span className="font-semibold">Amount:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  ₹{order?.totalAmount}
                </span>
              </p>

              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <span className="font-semibold">Payment:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    order?.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                      : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                  }`}
                >
                  {order?.paymentStatus}
                </span>
              </p>

              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <span className="font-semibold">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    order?.deliveryStatus === "Delivered"
                      ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                      : order?.deliveryStatus === "Out For Delivery"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white"
                      : order?.deliveryStatus === "Processing"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white"
                      : order?.deliveryStatus === "Cancelled"
                      ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {order?.deliveryStatus}
                </span>
              </p>
            </div>

            {/* Customer Info */}
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaUser className="text-purple-500" />
                <span className="font-semibold">Customer:</span>{" "}
                {order?.shippingAddress?.fullName}
              </p>

              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaPhoneAlt className="text-indigo-500" />
                <span className="font-semibold">Phone:</span>{" "}
                <a
                  href={`tel:${order?.shippingAddress?.phone}`}
                  className="text-blue-500 hover:underline"
                >
                  {order?.shippingAddress?.phone}
                </a>
              </p>

              <p className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                <FaMapMarkerAlt className="text-red-500 mt-1" />
                <span className="font-semibold">Address:</span>{" "}
                <span>
                  {order?.shippingAddress?.addressLine},{" "}
                  {order?.shippingAddress?.area},{" "}
                  {order?.shippingAddress?.landMark}
                </span>
              </p>

              {order?.shippingAddress?.lat && order?.shippingAddress?.long && (
                <a
                  href={`https://www.google.com/maps?q=${order.shippingAddress.lat},${order.shippingAddress.long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center mt-3 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition w-full sm:w-auto"
                >
                  <FaMapMarkerAlt className="mr-2" /> Open in Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <MdDeliveryDining className="text-orange-500" /> Pickup From
          </h2>

          <p className="text-gray-700 dark:text-gray-200 mb-2">
            <span className="font-semibold">Shop Name:</span>{" "}
            {order?.items?.[0]?.product?.shopName || "GullyFoods Main Outlet"}
          </p>

          {order?.shopAddress && (
            <p className="text-gray-700 dark:text-gray-200 mb-2">
              <span className="font-semibold">Address:</span>{" "}
              {order.shopAddress}
            </p>
          )}

          {order?.shopPhone && (
            <p className="text-gray-700 dark:text-gray-200 mb-2">
              <span className="font-semibold">Phone:</span>{" "}
              <a
                href={`tel:${order.shopPhone}`}
                className="text-blue-500 hover:underline"
              >
                {order.shopPhone}
              </a>
            </p>
          )}

          {order?.shopLat && order?.shopLong && (
            <a
              href={`https://www.google.com/maps?q=${order.shopLat},${order.shopLong}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition w-full sm:w-auto"
            >
              <FaMapMarkerAlt className="mr-2" /> View Shop on Map
            </a>
          )}
        </div>

        {/* Product List */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Products
        </h2>
        <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 mb-8">
          {order?.items?.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 py-2"
            >
              <span className="text-gray-800 dark:text-gray-100">
                {item.product.name}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                x{item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {order.deliveryStatus !== "Delivered" && (
            <button
              onClick={markAsOutForDelivery}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Confirm Pickup (Out For Delivery)
            </button>
          )}

          {order?.deliveryStatus === "Out For Delivery" && (
            <button
              onClick={confirmDelivery}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Confirm Order Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyOrder;
