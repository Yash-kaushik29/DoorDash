import axios from "axios";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { MdOutlineArrowOutward, MdAccessTimeFilled } from "react-icons/md";

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch User's Orders
  const fetchAllOrders = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/order/getUserOrders?page=${page}&limit=10`,
        { withCredentials: true }
      );

      if (data.success) {
        setOrders(data.orders);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } else {
        setError("Failed to get your Orders!");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch orders whenever the currentPage changes
  useEffect(() => {
    fetchAllOrders(currentPage);
  }, [currentPage]);

  // Pagination Handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // Format Date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get Color for Delivery Status
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-500";
      case "Processing":
        return "text-blue-500";
      case "Cancelled":
        return "text-red-500";
      case "Out for Delivery":
      case "Preparing":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Recent Orders</h1>

        {/* Loading & Error States */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-6 space-y-5">
            <MdAccessTimeFilled className="text-3xl text-green-500 animate-ping" />
            <p className="text-gray-500 dark:text-gray-300 text-lg text-center">
              Fetching your latest orders… ⏳
            </p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 p-6"
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  Order ID:
                  <Link
                    to={`/order/${order._id}`}
                    className="text-blue-500 hover:text-blue-600 transition ml-1 flex items-center hover:underline"
                  >
                    #{order.id}
                    <MdOutlineArrowOutward className="text-xl hover:translate-x-1 transition-transform" />
                  </Link>
                </h2>
                <p className="mb-2">
                  Total Amount:{" "}
                  <span className="text-green-600 font-bold">
                    ₹{order.amount}
                  </span>
                </p>
                <p className="mb-2">
                  Delivery Status:{" "}
                  <span className={getStatusColor(order.deliveryStatus)}>
                    {order.deliveryStatus}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Order Date: {formatDate(order.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-center">
          <ul className="inline-flex space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index}>
                <button
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
