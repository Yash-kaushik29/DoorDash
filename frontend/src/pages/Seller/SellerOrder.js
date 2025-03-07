import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SellerHeader from "../../components/SellerHeader";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

const SellerOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === order.products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(order.products.map((product) => product._id));
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/order/getorder/${orderId}`,
          { withCredentials: true }
        );
        setOrder(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const confirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/order/confirm-order/${orderId}`,
        { selectedProducts },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Order Confirmed!");
        setTimeout(() => {
          navigate("/seller");
        }, 2000);
      }
    } catch (error) {
      toast.error("Error confirming order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = () => {
    return order.products
      .filter((product) => product.status !== "Cancelled")
      .reduce((total, product) => total + product.price * product.quantity, 0);
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 dark:text-gray-300">
        Loading orders...
      </p>
    );

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />
      <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order ID: <span className="text-blue-600 dark:text-blue-400">#{order.orderId}</span>
          </h2>

          <div className="mt-4 space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedProducts.length === order.products.length}
                onChange={selectAll}
                className="w-4 h-4"
              />
              <span className="text-gray-900 dark:text-white">Select All</span>
            </label>

            {order.products.map((product, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-gradient-to-r from-green-100 to-green-50 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-md w-full"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product._id)}
                  onChange={() => toggleProductSelection(product._id)}
                  className="w-4 h-4 mr-3"
                />
                <img
                  src={product.image}
                  alt={product.productName}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-300 flex-shrink-0"
                />
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.productName}
                  </h3>
                  <p className="text-gray-800 dark:text-gray-300">Qty: {product.quantity}</p>
                  <p>
                    Status:{" "}
                    <span
                      className={`mt-1 text-sm font-semibold ${
                        product.status === "Delivered"
                          ? "text-green-600 dark:text-green-400" // ✅ Green for Delivered
                          : product.status === "Cancelled"
                          ? "text-red-600 dark:text-red-400" // ✅ Red for Cancelled
                          : product.status === "Preparing"
                          ? "text-yellow-600 dark:text-yellow-400" // ✅ Yellow for Preparing
                          : "text-blue-600 dark:text-blue-400" // ✅ Blue for any other status
                      }`}
                    >
                      {product.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Total Value: <span className="text-green-600 dark:text-green-400">₹{totalAmount()}</span>
            </h3>
            <button
              onClick={() => confirmOrder()}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrder;