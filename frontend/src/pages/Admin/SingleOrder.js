import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

const SingleOrder = () => {
  const { orderId: paramOrderId } = useParams();
  const [orderId, setOrderId] = useState(paramOrderId || "");
  const [order, setOrder] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // Fetch Order Details
  const fetchOrderDetails = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getOrderById/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // Fetch Delivery Boys
  const fetchDeliveryBoys = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getAllDeliveryBoys`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setDeliveryBoys(response.data.deliveryBoys);
      }
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
    fetchDeliveryBoys();
  }, [orderId]);

  // Handle Search
  const handleSearch = () => {
    if (orderId.length === 6) {
      fetchOrderDetails(orderId);
    } else {
      alert("Please enter a valid 6-character Order ID.");
    }
  };

  // Assign Delivery Boy
  const handleAssignDeliveryBoy = async () => {
    if (selectedDeliveryBoy) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/assignDeliveryBoy`,
          { orderId, deliveryBoyId: selectedDeliveryBoy },
          { withCredentials: true }
        );
        if (response.data.success) {
          alert("Delivery Boy assigned successfully!");
          fetchOrderDetails(orderId);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error assigning delivery boy:", error);
      }
    } else {
      alert("Please select a delivery boy.");
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/cancelOrder`,
        { orderId: order._id },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Order cancelled successfully!");
        fetchOrderDetails(orderId);
        setShowCancelPopup(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error cancelling order:", error)
      console.error("Error cancelling order:", error);
    }
  };

  // Get Status Color
  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "text-blue-600 bg-blue-100";
      case "Out for Delivery":
        return "text-yellow-600 bg-yellow-100";
      case "Preparing":
        return "text-orange-600 bg-orange-100";
      case "Delivered":
        return "text-green-600 bg-green-100";
      case "Cancelled": 
        return "text-red-600 bg-red-100";  
      default:
        return "text-gray-600 bg-gray-200";
    }
  };

  return (
    <div className="p-4 bg-gray-100 text-black dark:bg-gray-900 dark:text-white min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} />
      <AdminHeader />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold my-4">Order Details</h2>

        {/* Search Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter 6-character Order ID"
            className="border p-2 w-full rounded-md dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Search
          </button>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
            <h3 className="text-xl font-bold mb-2">
              Order ID: <span className="text-green-600">#{order.id}</span>
            </h3>
            <p className="mb-1">
              Status:{" "}
              <span className={`font-semibold ${getStatusColor(order.deliveryStatus)} px-1 py-1 rounded-lg`}>{order.deliveryStatus}</span>
            </p>
            <p className="mb-1">
              Payment Status:{" "}
              <span className={`${order.paymentStatus === 'Paid' ? "text-green-500" : "text-red-500"} font-semibold`}>{order.paymentStatus}</span>
            </p>
            <p className="mb-1">Total Price: ₹{order.amount}</p>
            <p>
              Delivery Boy:{" "}
              <span className="font-semibold">
                {order.deliveryBoy?.name || "Not Assigned"}
              </span>
            </p>
            <button
              onClick={() => setShowCancelPopup(true)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Cancel Order
            </button>

            <h4 className="mt-4 text-lg font-semibold">Products:</h4>
            <table className="w-full mt-2 bg-white dark:bg-gray-800 border rounded-md">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Product Name</th>
                  <th className="py-2 px-4 text-left">Quantity</th>
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Shop Name</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="py-2 px-4">{item.product?.name}</td>
                    <td className="py-2 px-4">{item.quantity}</td>
                    <td className="py-2 px-4">₹{item.product?.price}</td>
                    <td className="py-2 px-4">{item.product?.shopName}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showCancelPopup && (
              <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-md shadow-lg text-center dark:bg-gray-700">
                  <p className="text-lg font-bold">
                    Are you sure you want to cancel this order?
                  </p>
                  <div className="mt-4 flex justify-center gap-4">
                    <button
                      onClick={handleCancelOrder}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Yes, Cancel
                    </button>
                    <button
                      onClick={() => setShowCancelPopup(false)}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-800 rounded-md hover:bg-gray-400"
                    >
                      No, Go Back
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assign Delivery Boy */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">
            Assign/Change Delivery Boy:
          </h3>
          <div className="flex gap-2">
            <select
              value={selectedDeliveryBoy}
              onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
              className="border p-2 rounded-md w-full dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Delivery Boy</option>
              {deliveryBoys.length > 0 ? (
                deliveryBoys.map((boy) => (
                  <option key={boy._id} value={boy._id}>
                    {boy.name}
                  </option>
                ))
              ) : (
                <option disabled>No delivery boys available</option>
              )}
            </select>
            <button
              onClick={handleAssignDeliveryBoy}
              className={`px-4 py-2 rounded-md ${
                selectedDeliveryBoy
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              disabled={!selectedDeliveryBoy}
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleOrder;
