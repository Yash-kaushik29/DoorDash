import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaMotorcycle } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import ReviewSection from "../../components/ReviewSection";
import { ToastContainer, toast } from "react-toastify";
import { IoIosCart } from "react-icons/io";
import DownloadInvoiceButton from "../../components/DownloadInvoiceButton";
import api from "../../utils/axiosInstance";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await api.get(
          `/api/order/getOrderDetails/${orderId}`,
          { withCredentials: true }
        );
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || "Order not found!");
        }
      } catch (err) {
        setError("Failed to fetch order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 60000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Memoized function for badges
  const getStatusBadge = useCallback((status) => {
    switch (status) {
      case "Delivered":
        return {
          bg: "bg-green-100 dark:bg-green-700",
          text: "text-green-800 dark:text-white",
          icon: (
            <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 dark:text-green-200" />
          ),
        };
      case "Cancelled":
        return {
          bg: "bg-red-100 dark:bg-red-700",
          text: "text-red-800 dark:text-white",
          icon: (
            <IoCloseCircleOutline className="w-4 h-4 text-red-500 dark:text-red-200" />
          ),
        };
      case "Preparing":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-600",
          text: "text-yellow-800 dark:text-white",
          icon: (
            <IoTimeOutline className="w-4 h-4 text-yellow-500 dark:text-yellow-200" />
          ),
        };
      case "Out For Delivery":
        return {
          bg: "bg-blue-100 dark:bg-blue-600",
          text: "text-blue-800 dark:text-white",
          icon: (
            <FaMotorcycle className="w-4 h-4 text-blue-500 dark:text-blue-200" />
          ),
        };
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-600",
          text: "text-blue-800 dark:text-white",
          icon: <IoIosCart className="w-4 h-4" />,
        };
    }
  }, []);

  const deliveryBadge = getStatusBadge(order?.deliveryStatus);

  // Price formatting
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  // Calculate item total
  const getItemTotal = (item) =>
    item?.status !== "Cancelled" ? item?.product?.price * item?.quantity : 0;

  // Reusable Badge component
  const Badge = ({ bg, text, icon, children }) => (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${bg} ${text}`}
    >
      {icon} {children}
    </div>
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] dark:bg-gray-900">
        <DotLottieReact
          src="/lottie/Food.lottie"
          loop
          autoplay
          className="w-64 h-64"
        />
        <p className="text-center mt-6 text-gray-500 dark:text-white text-lg">
          Getting your order...
        </p>
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-10 text-red-600 dark:text-red-400">
        {error}
      </div>
    );

  return (
    <div className="mb-16 lg:mb-0">
      <ToastContainer />
      <Navbar />

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 py-6 px-2 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-4 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Order #{order?.id}</h2>
            {order.deliveryStatus === "Delivered" &&
              order.orderType === "Food" && (
                <DownloadInvoiceButton orderId={order._id} />
              )}
          </div>

          {/* Status Section */}
          <div className="flex flex-col gap-3 sm:text-sm mb-3">
            {/* Delivery Status */}
            <div className="flex items-center gap-1">
              <span className="text-gray-600 dark:text-gray-400">
                Delivery Status :
              </span>
              <Badge {...deliveryBadge} className="text-xs px-2 py-0.5">
                {order?.deliveryStatus}
              </Badge>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-1">
              <span className="text-gray-600 dark:text-gray-400">
                Payment Status :{" "}
              </span>
              <Badge
                bg={
                  order?.paymentStatus === "Paid"
                    ? "bg-green-100 dark:bg-green-700"
                    : "bg-red-100 dark:bg-red-700"
                }
                text={
                  order?.paymentStatus === "Paid"
                    ? "text-green-800 dark:text-white"
                    : "text-red-800 dark:text-white"
                }
                className="text-xs px-2 py-0.5"
                icon={
                  order?.paymentStatus === "Paid" ? (
                    <IoCheckmarkCircleOutline className="w-3 h-3 text-green-500 dark:text-green-200" />
                  ) : (
                    <IoCloseCircleOutline className="w-3 h-3 text-red-500 dark:text-red-200" />
                  )
                }
              >
                {order?.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Cancel Button */}
          {order?.deliveryStatus !== "Delivered" &&
            order?.deliveryStatus !== "Cancelled" && (
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowCancelPopup(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                >
                  Cancel Order
                </button>
              </div>
            )}

          {/* Review Section */}
          {order?.deliveryStatus === "Delivered" && (
            <ReviewSection order={order} />
          )}

          {/* Shipping Address */}
          <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Delivering To:</h3>
            <div className="flex flex-col gap-1">
              <p>👤 {order?.shippingAddress?.fullName}</p>
              <p>
                📍 {order?.shippingAddress?.addressLine},{" "}
                {order?.shippingAddress?.area}
              </p>
              <p>📞 {order?.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
            <div className="max-h-80 overflow-y-auto border rounded-lg shadow-sm">
              <ul className="divide-y divide-gray-300 dark:divide-gray-600">
                {order?.items?.map((item, index) => {
                  const itemStatus = getStatusBadge(item.status);
                  return (
                    <li
                      key={index}
                      className={`flex justify-between items-center py-3 px-2 transition-transform hover:scale-[1.01] ${
                        item.status === "Cancelled"
                          ? "opacity-50 line-through"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {item?.product?.name}
                        </p>
                        <span className="bg-yellow-200 dark:bg-yellow-600 px-2 py-1 rounded text-sm w-fit">
                          {item?.product?.shopName}
                        </span>
                        <p className="flex items-center gap-1 text-sm">
                          Status:
                          <span
                            className={`font-semibold ${itemStatus.text} flex items-center gap-1`}
                          >
                            {itemStatus.icon} {item.status}
                          </span>
                        </p>
                      </div>

                      <p className="text-lg mx-2 text-gray-600 dark:text-gray-400 font-semibold">
                        x{item?.quantity}
                      </p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {getItemTotal(item) > 0
                          ? formatPrice(getItemTotal(item))
                          : "--"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Totals */}
          <div className="my-6 text-right flex flex-col gap-1">
            <p className="font-semibold">
              Cart Total:{" "}
              <span className="text-green-500 ml-2">
                {formatPrice(order?.amount)}
              </span>
            </p>
            <p className="font-semibold">
              Delivery Fee:{" "}
              <span className="text-green-500 ml-2">
                {formatPrice(order?.deliveryCharge)}
              </span>
            </p>
            {order?.discount > 0 && (
              <p className="font-semibold">
                Coupon Discount:{" "}
                <span className="text-green-500 ml-2">
                  -{formatPrice(order?.discount)}
                </span>
              </p>
            )}
            <div className="h-[1px] bg-black dark:bg-white my-2"></div>
            <p className="font-semibold text-lg">
              Total:{" "}
              <span className="text-green-700 dark:text-green-300 ml-2 font-bold">
                {formatPrice(order?.totalAmount)}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Payment Method:{" "}
              <span className="font-medium">{order?.paymentMethod}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Placed On:{" "}
              <span className="font-medium">
                {new Date(order?.createdAt).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Cancel Order
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Orders move to <strong>“Preparing”</strong> quickly to ensure
              on-time delivery. Direct cancellation isn’t available, but our
              support team can help you.
            </p>
            <button
              onClick={() =>
                window.open(
                  "https://wa.me/917409565977?text=Hi, I’d like to cancel my recent order from GullyFoods."
                )
              }
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold w-full transition mb-2"
            >
              Contact Customer Service
            </button>
            <button
              onClick={() => setShowCancelPopup(false)}
              className="w-full border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
