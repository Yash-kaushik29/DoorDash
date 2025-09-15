import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaMotorcycle } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import OrderDetailsLoader from "../../components/OrderDetailsLoader";
import ReviewSection from "../../components/ReviewSection";
import { ToastContainer, toast } from "react-toastify";
import { IoIosCart } from "react-icons/io";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/order/getOrderDetails/${orderId}`,
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
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${bg} ${text}`}
    >
      {icon} {children}
    </div>
  );

  if (loading) return <OrderDetailsLoader />;
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
        {/* Order Summary */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-4">
          <h2 className="text-2xl font-semibold mb-4">Order #{order?.id}</h2>

          {/* Status Row */}
          <div className="flex flex-col xs:flex-row justify-start xs:justify-between items-start xs:items-center mb-4 gap-2 sm:gap-4">
            <Badge {...deliveryBadge}>{order?.deliveryStatus}</Badge>
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
              icon={
                order?.paymentStatus === "Paid" ? (
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 dark:text-green-200" />
                ) : (
                  <IoCloseCircleOutline className="w-4 h-4 text-red-500 dark:text-red-200" />
                )
              }
            >
              Payment: {order?.paymentStatus}
            </Badge>
          </div>

          {/* Review Section */}
          {order?.deliveryStatus === "Delivered" && (
            <ReviewSection order={order} />
          )}

          {/* Shipping Address */}
          {order?.deliveryStatus !== "Delivered" && (
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
          )}

          {/* Items List */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
            <div className="max-h-80 overflow-y-auto border rounded-lg shadow-sm">
              <ul className="divide-y divide-gray-300 dark:divide-gray-600">
                {order?.items?.map((item, index) => {
                  const itemStatus = getStatusBadge(item.status);
                  return (
                    <li
                      key={index}
                      className={`flex justify-between items-center py-3 px-2 transition-transform hover:scale-101 ${
                        item.status === "Cancelled"
                          ? "opacity-50 line-through"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {item?.product?.name}
                        </p>
                        <span className="bg-yellow-200 dark:bg-yellow-600 px-2 py-1 rounded text-sm">
                          {item?.product?.shopName}
                        </span>
                        <p className="flex items-center gap-1">
                          Status:
                          <span
                            className={`text-sm font-semibold ${itemStatus.text} flex items-center gap-1`}
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

          {/* Total Amount */}
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
            <p className="font-semibold">
              Tax:{" "}
              <span className="text-green-500 ml-2">
                {formatPrice(order?.taxes)}
              </span>
            </p>
            {order?.convenienceFees > 0 && (
              <p className="font-semibold">
                Multiple Store Convenience Fee:{" "}
                <span className="text-green-500 ml-2">
                  {formatPrice(order?.convenienceFees)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
