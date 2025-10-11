import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const observer = useRef();
  const navigate = useNavigate();

  // Fetch Orders
  const fetchOrders = async (pageNum = 1, statusFilter = filter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/api/admin/getOrdersByMonth?page=${pageNum}&limit=10&filter=${statusFilter}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        if (pageNum === 1) {
          setOrders(response.data.orders);
        } else {
          setOrders((prevOrders) => [...prevOrders, ...response.data.orders]);
        }
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce Filter Change to Avoid Extra API Calls
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchOrders(1, filter);
    }, 300);
    return () => clearTimeout(timeout);
  }, [filter]);

  // Load More Orders on Scroll
  const lastOrderRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loading]
  );

  // Load More Orders When Page Changes
  useEffect(() => {
    if (page > 1) fetchOrders(page, filter);
  }, [page]);

  // Get Status Color
  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "text-yellow-500 bg-yellow-100";
      case "Out for Delivery":
        return "text-blue-500 bg-blue-100";
      case "Delivered":
        return "text-green-500 bg-green-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  return (
    <div className="bg-gray-100 text-black dark:bg-gray-900 dark:text-white min-h-screen">
      <AdminHeader />

      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Orders of this Month</h2>

        {/* Filter Options */}
        <div className="mb-4 flex flex-wrap gap-4">
          {["All", "Processing", "Out for Delivery", "Delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              disabled={loading}
              className={`px-4 py-2 rounded-md transition ${
                filter === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Order List */}
        <ul className="space-y-4">
          {orders.map((order, index) => (
            <li
              onClick={() => navigate(`/viewOrder/${order.id}`)}
              key={order.id}
              ref={index === orders.length - 1 ? lastOrderRef : null}
              className="bg-white dark:bg-gray-800 cursor-pointer p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start md:items-center"
            >
              <div className="flex-grow">
                <p className="text-lg font-semibold">
                  Order ID: <span className="text-green-500">#{order.id}</span>
                </p>
                <p>Items: {order.items.length}</p>
                <p>Total Price: ₹{order.amount}</p>
                <p>
                  Date: {new Date(order.createdAt).toLocaleDateString()}{" "}
                  <span className="text-gray-600 dark:text-gray-300 ml-1">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </p>
              </div>

              <div className="mt-2 md:mt-0 md:ml-4 flex flex-col space-y-2 items-end">
                <span className={`px-2 py-1 rounded-md text-sm font-medium ${getStatusColor(order.deliveryStatus)}`}>
                  {order.deliveryStatus}
                </span>
                <span
                  className={`px-2 py-1 rounded-md text-sm font-medium ${
                    order.paymentStatus === "Paid" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {loading && <p className="text-center py-4">Loading more orders...</p>}
        {!hasMore && !loading && <p className="text-center py-4">No more orders to display.</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
