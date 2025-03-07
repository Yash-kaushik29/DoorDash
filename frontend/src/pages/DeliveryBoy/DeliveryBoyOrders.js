import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const DeliveryBoyOrders = () => {
  const { status } = useParams();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const filters = ["All", "Pending", "Delivered"];
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const deliveryBoyId = decoded.id;
  
    if(!token) {
      navigate('/delivery/login');
    }

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/delivery/orders`, {
        params: {
          page: currentPage,
          limit: 5,
          status: status || "all",
          deliveryBoyId,
        },
      });
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClick = (orderId) => {
    navigate(`/delivery/order/${orderId}`);
  };

  const handleFilterChange = (filter) => {
    navigate(`/delivery/orders/${filter.toLowerCase()}`);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when status changes
  }, [status]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, status]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DeliveryBoyHeader />

      <div className="p-4">
        {/* Filter Buttons */}
        <div className="flex gap-4 mb-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-2 rounded-2xl shadow-md font-semibold transition-all 
                ${
                  status === filter.toLowerCase() ||
                  (filter === "All" && !status)
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}{" "}
            Orders
          </h2>

          {orders.length > 0 ? (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  onClick={() => handleClick(order._id)}
                  key={order._id}
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Order ID:{" "}
                    <span className="text-orange-400 hover:underline">
                      #{order.id}
                    </span>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Status:{" "}
                    <span
                      className={`font-semibold 
    ${
      order.deliveryStatus === "Delivered"
        ? "text-green-500"
        : order.deliveryStatus === "Processing"
        ? "text-blue-500"
        : "text-yellow-500"
    }`}
                    >
                      {order.deliveryStatus}
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Amount:{" "}
                    <span className="text-green-500">₹{order.amount}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ordered On: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">No orders found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md shadow transition-all 
              ${
                currentPage === 1
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Previous
          </button>

          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md shadow transition-all 
              ${
                currentPage === totalPages
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyOrders;
