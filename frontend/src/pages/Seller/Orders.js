import React, { useEffect, useState } from "react";
import SellerHeader from "../../components/SellerHeader";
import axios from "axios";
import { Link } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/order/getAllOrders`,
          { withCredentials: true }
        );
        if (data.success) {
          setOrders(data.orders);
          setFilteredOrders(data.orders);
        } else {
          setError("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (filter === "All") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.deliveryStatus === filter)
      );
    }
  }, [filter, orders]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-10">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">{error}</div>
    );
  }

  return (
    <div className="mb-16 lg:mb-0">
      <SellerHeader />
      <div className="max-w-4xl mx-auto p-6">
        {/* Filter Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          {["All", "Processing", "Delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold shadow-md transition ${
                filter === status
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300">
              No orders found.
            </p>
          ) : (
            filteredOrders.map((order) => (
              <Link 
                to={`/getOrderDetails/${order._id}`}
                key={order._id} 
                className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg flex justify-between items-center"
              >
                {/* Order ID */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Order ID:{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      #{order.id}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Items: {order.items.length} | Total: ₹{order.amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    order.deliveryStatus === "Delivered"
                      ? "bg-green-600 text-white"
                      : order.deliveryStatus === "Processing"
                      ? "bg-blue-500 text-black"
                      : "bg-yellow-400 text-white"
                  }`}
                >
                  {order.deliveryStatus}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
