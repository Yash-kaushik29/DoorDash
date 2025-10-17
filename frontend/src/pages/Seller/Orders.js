import React, { useEffect, useState } from "react";
import SellerHeader from "../../components/SellerHeader";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../utils/axiosInstance";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;

  const handleError = (err, defaultMessage) => {
    console.error(err);

    const message =
      err.response?.data?.message ||
      (err.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : err.message?.includes("Network Error")
        ? "Network issue detected. Check your internet connection."
        : defaultMessage);

    setError(message);
    toast.error(message);
  };

  const fetchOrders = async (retry = false) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(
        `/api/order/getAllOrders?page=${currentPage}&limit=${ordersPerPage}`,
        {
          withCredentials: true,
          timeout: 7000, 
        }
      );

      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
        setTotalOrders(data.totalOrders);
      } else {
        setError(data.message || "Failed to fetch orders.");
      }
    } catch (err) {
      handleError(err, "Error fetching orders. Please try again later.");

      // 🔁 Optional retry for network/timeouts
      if (
        !retry &&
        (err.code === "ECONNABORTED" || err.message.includes("Network"))
      ) {
        setTimeout(() => fetchOrders(true), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  useEffect(() => {
    if (filter === "All") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.deliveryStatus === filter)
      );
    }
  }, [filter, orders]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-600 text-white";
      case "Processing":
        return "bg-blue-500 text-white";
      case "Cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-yellow-400 text-black";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4 mt-10">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse p-4 space-y-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // ❌ Error state with retry
  if (error) {
    return (
      <>
      <SellerHeader />
      <div className="flex flex-col items-center mt-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchOrders()}
          className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          Retry
        </button>
      </div>
      </>
    );
  }

  return (
    <div className="mb-16 lg:mb-0">
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />
      <div className="max-w-4xl mx-auto p-6">
        {/* Filter Buttons */}
        <div className="flex justify-center flex-wrap gap-4 mb-6">
          {["All", "Processing", "Delivered", "Cancelled"].map((status) => (
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
                className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center transition transform duration-200 hover:scale-105 hover:shadow-xl"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Order ID:{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      #{order.id}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Items: {order.items.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold mt-2 md:mt-0 ${getStatusClass(
                    order.deliveryStatus
                  )}`}
                >
                  {order.deliveryStatus}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.ceil(totalOrders / ordersPerPage) }).map(
            (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
