import axios from "axios";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { MdOutlineArrowOutward, MdAccessTimeFilled } from "react-icons/md";
import api from "../../utils/axiosInstance";

const OrderCard = ({ order }) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 p-6">
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
        <span className="text-green-600 font-bold">₹{order.totalAmount}</span>
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
  );
};

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async (page = 1) => {
      try {
        setLoading(true);

        const { data } = await api.get(
          `/api/order/getUserOrders?page=${page}&limit=5`,
          {
            withCredentials: true,
          }
        );

        if (!isMounted) return;

        if (data.success) {
          setOrders(data.orders);
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
          setError("");
        } else {
          setError("Failed to get your Orders!");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders(currentPage);

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => paginate(currentPage - 1)}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          Prev
        </button>
      );
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === i
              ? "bg-green-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          aria-label={`Go to page ${i}`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => paginate(currentPage + 1)}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          Next
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Recent Orders</h1>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-6 space-y-5">
            <MdAccessTimeFilled className="text-3xl text-green-500 animate-ping" />
            <p className="text-gray-500 dark:text-gray-300 text-lg text-center">
              Fetching your latest orders… ⏳
            </p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 flex flex-col gap-4">
            <p>{error}</p>
            <button
              onClick={() => paginate(currentPage)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No recent orders found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;
