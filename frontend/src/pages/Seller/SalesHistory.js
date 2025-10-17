import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import SellerHeader from "../../components/SellerHeader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../utils/axiosInstance";
import { SellerContext } from "../../context/sellerContext";

const SalesHistory = () => {
  const [filter, setFilter] = useState("today");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { sellerId, ready } = useContext(SellerContext);
  const navigate = useNavigate();

  // 🔒 Redirect if seller not logged in
  useEffect(() => {
    if (ready && !sellerId) {
      toast.warning("Please log in to access your sales history!");
      setTimeout(() => {
        navigate("/seller");
      }, 2000);
    }
  }, [ready, sellerId, navigate]);

  const fetchSalesHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/api/shop/sales-history`, {
        withCredentials: true,
      });

      if (data.success) {
        setSalesData(data.salesHistory || []);
      } else {
        setSalesData([]);
        setError(data.message || "Failed to fetch sales history.");
        toast.error(data.message || "Failed to fetch sales history.");
      }
    } catch (err) {
      console.error("Error fetching sales history:", err);
      setError("Unable to load sales data. Please try again later.");
      toast.error("Network error while fetching sales history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && sellerId) fetchSalesHistory();
  }, [ready, sellerId]);

  const getFilteredSales = () => {
    const now = new Date();
    switch (filter) {
      case "today":
        return salesData.filter(
          (sale) => new Date(sale.date).toDateString() === now.toDateString()
        );
      case "week":
        const weekStart = new Date();
        weekStart.setDate(now.getDate() - now.getDay());
        return salesData.filter((sale) => new Date(sale.date) >= weekStart);
      case "month":
        return salesData.filter(
          (sale) =>
            new Date(sale.date).getMonth() === now.getMonth() &&
            new Date(sale.date).getFullYear() === now.getFullYear()
        );
      default:
        return [];
    }
  };

  const filteredSales = getFilteredSales();
  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);

  if (!ready) return <div className="text-center mt-10">Loading...</div>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Sales History
        </h1>

        {/* Filter Buttons */}
        <div className="flex gap-3">
          {["today", "week", "month"].map((period) => (
            <button
              key={period}
              onClick={() => setFilter(period)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === period
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-white"
              }`}
            >
              {period === "today"
                ? "Today"
                : period === "week"
                ? "This Week"
                : "This Month"}
            </button>
          ))}
        </div>

        {/* Total Sales Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
            Total Sales (
            {filter === "today"
              ? "Today"
              : filter === "week"
              ? "This Week"
              : "This Month"}
            )
          </h2>
          <p className="text-2xl font-bold text-green-500">₹{totalAmount}</p>
        </div>

        {loading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-6">
            <p className="text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchSalesHistory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredSales.length > 0 ? (
              <div className="space-y-2">
                {filteredSales.map((sale, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center"
                  >
                    <Link
                      to={`/getOrderDetails/${sale?.order?._id}`}
                      className="text-yellow-500 font-semibold underline"
                    >
                      #{sale?.order?._id?.slice(-6) || "Order"}
                    </Link>
                    <span>{new Date(sale.date).toLocaleDateString()}</span>
                    <span className="font-bold text-green-500">
                      ₹{sale.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
                No sales data found for this period.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SalesHistory;
