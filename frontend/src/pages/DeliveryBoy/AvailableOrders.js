import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";

const AvailableOrders = ({ deliveryBoyId }) => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('GullyFoodsDeliveryToken');
  const navigate = useNavigate()

  useEffect(() => {
      if (!token) {
        navigate("/delivery/login");
      }
    }, [token, navigate]);

  // Fetch unassigned orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/delivery/get-available-orders`
      );
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Error fetching available orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    const decoded = jwtDecode(token);
    const deliveryBoyId = decoded.id;

    try {
      const res = await api.post(
        `/api/delivery/orders/${orderId}/accept`,
        { deliveryBoyId }
      );

      if (res.data.success) {
        toast.success("Order accepted successfully!");
        fetchOrders();

        setTimeout(() => {
          navigate('/delivery/orders/pending');
        }, 2000)
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Error accepting order:", err);
      toast.error("Failed to accept order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
       <ToastContainer />
      <DeliveryBoyHeader />
      <div className="p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
        {loading === true ? (
          <div className="flex items-center justify-center min-h-screen dark:bg-gray-800">
            <div className="flex flex-col items-center gap-3 text-gray-800 dark:text-gray-200">
              <FaSearch className="animate-ping w-10 h-10 text-green-500" />
              <p className="text-lg font-semibold">Looking for Orders...</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
              Available Orders
            </h2>

            {orders.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No available orders right now.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  // Remove duplicate shops
                  const uniqueShops = [
                    ...new Set(
                      (order.items || []).map(
                        (item) =>
                          item.product?.shopName ||
                          item.seller?.username ||
                          "Unknown Shop"
                      )
                    ),
                  ];

                  return (
                    <div
                      key={order._id}
                      className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-md text-sm"
                    >
                      {/* Order ID */}
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        #{order.id}
                      </p>

                      {/* Shops */}
                      <p className="text-gray-600 dark:text-gray-300 truncate">
                        Shops 🏬 : {uniqueShops.join(", ")}
                      </p>

                      {/* Delivery Charge */}
                      <p className="text-gray-600 dark:text-gray-300">
                        Your commission 🚚 : <span className="text-green-500 font-semibold">₹{order.deliveryCharge + order.convenienceFees}</span>
                      </p>

                      {/* Address (short form) */}
                      <p className="text-gray-600 dark:text-gray-300 truncate">
                        Address 📍: {order.shippingAddress?.area},{" "}
                        {order.shippingAddress?.landMark ||
                          order.shippingAddress?.addressLine}
                      </p>

                      {/* Accept button */}
                      <button
                        onClick={() => acceptOrder(order._id)}
                        className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-md text-sm"
                      >
                        ✅ Accept
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AvailableOrders;
