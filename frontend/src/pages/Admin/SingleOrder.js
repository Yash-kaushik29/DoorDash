import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import api from "../../utils/axiosInstance";

const SingleOrder = () => {
  const { orderId: paramOrderId } = useParams();
  const [orderId, setOrderId] = useState(paramOrderId || "");
  const [order, setOrder] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // Modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");

  // Fetch Order Details
  const fetchOrderDetails = async (id) => {
    try {
      const response = await api.get(`/api/admin/getOrderById/${id}`, {
        withCredentials: true,
      });
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
      const response = await api.get(`/api/admin/getAllDeliveryBoys`, {
        withCredentials: true,
      });
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
        const response = await api.post(
          `/api/admin/assignDeliveryBoy`,
          { orderId: order._id, deliveryBoyId: selectedDeliveryBoy },
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

  // Cancel Order
  const handleCancelOrder = async () => {
    try {
      const response = await api.put(
        `/api/admin/cancelOrder`,
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
      toast.error("Error cancelling order:", error);
      console.error("Error cancelling order:", error);
    }
  };

  // Preparing Button
  const markAsPreparing = async () => {
    try {
      const response = await api.put(
        `/api/admin/updateDeliveryStatus`,
        { orderId: order._id },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Order marked as Preparing!");
        fetchOrderDetails(orderId);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error updating status");
      console.error(error);
    }
  };

  const generateMessage = (type) => {
    if (!order) return;

    const name = order.shippingAddress.fullName;
    const id = order.id;
    const link = `https://gullyfoods.app/order/${order._id}`;

    let line2 =
      type === "freebies"
        ? `Hope your last order #${id} from GullyFoods was as sweet as the surprise that came with it 😉💚`
        : `Hope your last order #${id} from GullyFoods was delivered on time! 💚`;

    const msg = `Hey ${name}!
${line2}

We’d love to know how your experience was — your feedback helps us make every bite better!  
Please drop us a review by visiting the order details page.

Thanks for being part of the GullyFoods family — we can’t wait to serve you again soon! 🚀🍴

— Team **GullyFoods**

Link: ${link}`;

    setGeneratedMessage(msg);
    setShowMessageModal(true);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast.success("Message copied to clipboard!");
  };

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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold my-4">Order Details</h2>

        {/* Search */}
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

        {order && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
            <h3 className="text-xl font-bold mb-2">
              Order ID: <span className="text-green-600">#{order.id}</span>
            </h3>

            <p className="mb-1">
              Status:{" "}
              <span
                className={`font-semibold ${getStatusColor(
                  order.deliveryStatus
                )} px-2 py-1 rounded-lg`}
              >
                {order.deliveryStatus}
              </span>
            </p>

            {/* Preparing Button */}
            {order.deliveryStatus === "Processing" && (
              <button
                onClick={markAsPreparing}
                className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Mark as Preparing
              </button>
            )}

            <p className="mb-1">
              Payment Status:{" "}
              <span
                className={`${
                  order.paymentStatus === "Paid"
                    ? "text-green-500"
                    : "text-red-500"
                } font-semibold`}
              >
                {order.paymentStatus}
              </span>
            </p>

            <p className="mb-1">Total Price: ₹{order.totalAmount}</p>

            <p className="mb-1">
              Delivery Boy:{" "}
              <span className="font-semibold">
                {order.deliveryBoy?.name || "Not Assigned"}
              </span>
            </p>

            <p className="my-2">
              Order From{" "}
              <span className="text-green-600 font-semibold">
                {order.items[0]?.product.shopName}
              </span>
            </p>


            {/* Delivery Address */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h4 className="text-lg font-semibold mb-2">Delivery Address</h4>

              <p>
                <strong>{order.shippingAddress.fullName}</strong> —{" "}
                {order.shippingAddress.phone}
              </p>
              <p>{order.shippingAddress.addressLine}</p>
              <p>{order.shippingAddress.area}</p>
              {order.shippingAddress.landMark && (
                <p>Landmark: {order.shippingAddress.landMark}</p>
              )}

              <a
                href={`https://maps.google.com/?q=${order.shippingAddress.lat},${order.shippingAddress.long}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline mt-1 inline-block"
              >
                View on Map
              </a>
            </div>

            {/* Review Section */}
            {order.hasReviewed && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 className="text-lg font-semibold mb-2">Customer Review</h4>
                <p>
                  <strong>App Rating:</strong> {order.appRatings} / 5
                </p>
                <p>
                  <strong>Delivery Rating:</strong> {order.deliveryRatings} / 5
                </p>
                <p>
                  <strong>Overall Rating:</strong> {order.overallRatings} / 5
                </p>
                <p className="mt-2 italic">"{order.review}"</p>
              </div>
            )}

            {/* Cancel Order */}
            <button
              onClick={() => setShowCancelPopup(true)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Cancel Order
            </button>

            {/* Delivered message buttons */}
            <h4 className="mt-6 text-lg font-semibold">Send Review Message:</h4>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => generateMessage("freebies")}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Delivered (with freebies)
              </button>

              <button
                onClick={() => generateMessage("normal")}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Delivered (without freebies)
              </button>
            </div>

            {/* Product List */}
            <h4 className="mt-6 text-lg font-bold">Products:</h4>
            <table className="w-full mt-2 bg-white dark:bg-gray-800 border rounded-md">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Product Name</th>
                  <th className="py-2 px-4 text-left">Quantity</th>
                  <th className="py-2 px-4 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="py-2 px-4">{item.product?.name}</td>
                    <td className="py-2 px-4">{item.quantity}</td>
                    <td className="py-2 px-4">
                      {item.quantity} * ₹{item.product?.price} ={" "}
                      <span className="text-green-500 font-semibold">
                        ₹{item.quantity * item.product?.price}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cancel Popup */}
            {showCancelPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg">
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
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md"
                    >
                      No, Go Back
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Message Modal */}
            {showMessageModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-md w-96 shadow-lg">
                  <h3 className="text-xl font-bold mb-2">Generated Message</h3>

                  <textarea
                    value={generatedMessage}
                    readOnly
                    className="w-full h-48 p-2 border rounded-md dark:bg-gray-700"
                  />

                  <button
                    onClick={copyMessage}
                    className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Copy Message
                  </button>

                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="mt-2 w-full px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-md"
                  >
                    Close
                  </button>
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
