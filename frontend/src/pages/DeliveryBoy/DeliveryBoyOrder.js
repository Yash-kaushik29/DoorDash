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
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("GullyFoodsDeliveryToken");

  useEffect(() => {
    if (!token) {
      navigate("/delivery/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/api/delivery/order/${orderId}`, {
          withCredentials: true,
        });
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const markAsOutForDelivery = async () => {
    if (
      order?.deliveryStatus === "Delivered" ||
      order?.deliveryStatus === "Out For Delivery"
    ) {
      toast.info("Order already picked up or delivered");
      return;
    }

    try {
      setUpdating(true);

      await api.put(
        `/api/delivery/order/confirm-pickup`,
        { orderId },
        { withCredentials: true },
      );

      toast.success("Order marked as Out For Delivery ✅");

      setOrder((prev) => ({
        ...prev,
        deliveryStatus: "Out For Delivery",
      }));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelivery = async () => {
    if (order?.deliveryStatus === "Delivered") {
      toast.info("This order is already delivered ✅");
      return;
    }

    try {
      setUpdating(true);

      await api.put(
        `/api/delivery/order/confirm-delivery/${orderId}`,
        {},
        { withCredentials: true },
      );

      toast.success("Order marked as Delivered 🎉");

      setOrder((prev) => ({
        ...prev,
        deliveryStatus: "Delivered",
        paymentStatus: "Paid",
      }));
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error("Failed to confirm delivery");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading order...</p>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Order not found.</p>
      </div>
    );

  return (
    <div>
      <DeliveryBoyHeader />
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Order Details
        </h1>

        {/* Order Info */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <IoFastFoodSharp className="text-green-500" /> Order Info
          </h2>

          <p className="mb-2">
            <strong>Status:</strong>{" "}
            <span className="font-bold">{order.deliveryStatus}</span>
          </p>

          <p className="mb-2">
            <strong>Amount:</strong> ₹{order.totalAmount}
          </p>

          <p>
            <strong>Payment:</strong> {order.paymentStatus}
          </p>
        </div>

        {/* Customer Info */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaUser className="text-purple-500" /> Customer
          </h2>

          <p>{order.shippingAddress?.fullName}</p>
          <p>
            <a href={`tel:${order.shippingAddress?.phone}`}>
              {order.shippingAddress?.phone}
            </a>
          </p>
        </div>

        {/* Products */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Products</h2>

          {order?.items?.map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b">
              <span>{item.product.name}</span>
              <span>x{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Pickup Button */}
          {order.deliveryStatus === "Processing" && (
            <button
              onClick={markAsOutForDelivery}
              disabled={updating}
              className={`px-6 py-3 rounded-lg text-white ${
                updating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {updating ? "Updating..." : "Confirm Pickup"}
            </button>
          )}

          {/* Delivery Button */}
          {order.deliveryStatus === "Out For Delivery" && (
            <button
              onClick={confirmDelivery}
              disabled={updating || order.deliveryStatus === "Delivered"}
              className={`px-6 py-3 rounded-lg text-white ${
                updating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {updating ? "Confirming..." : "Confirm Delivered"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyOrder;
