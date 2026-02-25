import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import DeliveryTimeline from "../../components/DeliveryTimeline";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await api.get(`/api/order/getOrderDetails/${orderId}`, {
        withCredentials: true,
      });

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

  useEffect(() => {
    let interval;
    fetchOrderDetails();

    interval = setInterval(() => {
      if (
        order?.deliveryStatus !== "Delivered" &&
        order?.deliveryStatus !== "Cancelled"
      ) {
        fetchOrderDetails();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [orderId, order?.deliveryStatus]);

  const refreshOrder = async () => {
    await fetchOrderDetails();
    toast.success("Order status updated");
  };

  const getStatusMessage = () => {
    switch (order?.deliveryStatus) {
      case "Processing":
      case "Preparing":
        return "👨‍🍳 Your order is being freshly prepared";
      case "Out For Delivery":
        return "🛵 Your order is on the way";
      case "Delivered":
        return "🎉 Delivered successfully — enjoy your meal!";
      case "Cancelled":
        return "❌ This order was cancelled";
      default:
        return "📦 Order received";
    }
  };

  const totals = useMemo(() => {
    if (!order) return {};
    return {
      amount: order.amount || 0,
      taxes: order.taxes || 0,
      deliveryCharge: order.deliveryCharge || 0,
      serviceCharge: order.serviceCharge || 0,
      discount: order.discount || 0,
      totalAmount: order.totalAmount || 0,
    };
  }, [order]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  const getStatusBadge = useCallback((status) => {
    switch (status) {
      case "Delivered":
        return {
          bg: "bg-green-100 dark:bg-green-700",
          text: "text-green-800 dark:text-green-500",
          icon: <IoCheckmarkCircleOutline className="w-4 h-4" />,
        };
      case "Cancelled":
        return {
          bg: "bg-red-100 dark:bg-red-700",
          text: "text-red-800 dark:text-red-500",
          icon: <IoCloseCircleOutline className="w-4 h-4" />,
        };
      case "Preparing":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-600",
          text: "text-yellow-800 dark:text-yellow-500",
          icon: <IoTimeOutline className="w-4 h-4" />,
        };
      case "Out For Delivery":
        return {
          bg: "bg-blue-100 dark:bg-blue-600",
          text: "text-blue-800 dark:text-blue-400",
          icon: <FaMotorcycle className="w-4 h-4" />,
        };
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-600",
          text: "text-blue-800 dark:text-blue-400",
          icon: <IoIosCart className="w-4 h-4" />,
        };
    }
  }, []);

  const Badge = ({ bg, text, icon, children }) => (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${bg} ${text}`}
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
    return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="mb-16 lg:mb-0">
      <ToastContainer />
      <Navbar />

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 px-2 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mt-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">Order #{order?.id}</h2>
              <button
                onClick={refreshOrder}
                className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
              >
                Refresh
              </button>
            </div>

            {order.deliveryStatus === "Delivered" &&
              order.orderType === "Food" && (
                <DownloadInvoiceButton orderId={order._id} />
              )}
          </div>

          {/* Timeline */}
          <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 mb-3">
            <DeliveryTimeline currentStatus={order?.deliveryStatus} />
          </div>

          {/* Status Message */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 font-medium mb-4">
            {getStatusMessage()}
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

          {/* Items Ordered */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>

            {order?.orderType === "Food" && order?.items?.length > 0 && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 via-emerald-500 to-emerald-600 text-white font-semibold text-center">
                {order.items[0]?.product?.shopName}
              </div>
            )}

            <div className="max-h-80 overflow-y-auto border rounded-lg shadow-sm">
              <ul className="divide-y divide-gray-300 dark:divide-gray-600">
                {order?.items?.map((item, index) => {
                  const itemStatus = getStatusBadge(item.status);

                  return (
                    <li
                      key={index}
                      className={`flex justify-between items-center py-3 px-3 ${
                        item.status === "Cancelled"
                          ? "opacity-50 line-through"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {item?.product?.name}
                        </p>
                        <p className="flex items-center gap-1 text-sm">
                          <span
                            className={`font-semibold ${itemStatus.text} flex items-center gap-1`}
                          >
                            {itemStatus.icon} {item.status}
                          </span>
                        </p>
                      </div>

                      <p className="text-lg text-gray-600 dark:text-gray-400 font-semibold">
                        × {item?.quantity}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Savings Highlight */}
          {totals.discount > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold">
              🎉 You saved {formatPrice(totals.discount)} on this order
            </div>
          )}

          {/* Totals */}
          <div className="my-6 text-right flex flex-col gap-1">
            <p>
              Cart Total:{" "}
              <span className="text-green-500 ml-2 font-semibold">
                {formatPrice(totals.amount)}
              </span>
            </p>
            <p>
              Tax:{" "}
              <span className="text-green-500 ml-2 font-semibold">
                {formatPrice(totals.taxes)}
              </span>
            </p>
            <p>
              Delivery Fee:{" "}
              <span className="text-green-500 ml-2 font-semibold">
                {formatPrice(totals.deliveryCharge)}
              </span>
            </p>
            {order?.orderType === "Grocery" && (
              <p>
                Service Charge:{" "}
                <span className="text-green-500 ml-2 font-semibold">
                  {formatPrice(totals.serviceCharge)}
                </span>
              </p>
            )}
            <div className="h-[1px] bg-black dark:bg-white my-2" />
            <p className="font-semibold text-lg">
              Total:
              <span className="text-green-700 dark:text-green-300 ml-2 font-bold">
                {formatPrice(totals.totalAmount)}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {" "}
              Payment Method:{" "}
              <span className="font-medium ml-1">
                {order?.paymentMethod}
              </span>{" "}
            </p>{" "}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {" "}
              Placed On:{" "}
              <span className="font-medium ml-1">
                {" "}
                {new Date(order?.createdAt).toLocaleString()}{" "}
              </span>{" "}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold mb-3">Cancel Order</h3>
            <p className="text-sm mb-4">
              Our support team can help you cancel this order.
            </p>
            <button
              onClick={() =>
                window.open(
                  "https://wa.me/917409565977?text=Hi, I’d like to cancel my recent order from GullyFoods.",
                )
              }
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg w-full mb-2"
            >
              Contact Support
            </button>
            <button
              onClick={() => setShowCancelPopup(false)}
              className="w-full border py-2 rounded-lg"
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
