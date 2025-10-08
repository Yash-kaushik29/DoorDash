import React, { useState, useEffect } from "react";
import axios from "axios";
import {Link} from 'react-router-dom';
import SellerHeader from '../../components/SellerHeader';

const SalesHistory = () => {
  const [filter, setFilter] = useState("today");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("GullyFoodsSellerToken");

  const fetchSalesHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/shop/sales-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSalesData(data.salesHistory || []);
    } catch (error) {
      console.error("Error fetching sales history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesHistory();
  }, []);

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

  return (
    <>
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

      {/* Total Sales */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
          Total Sales ({filter === "today"
            ? "Today"
            : filter === "week"
            ? "This Week"
            : "This Month"})
        </h2>
        <p className="text-2xl font-bold text-green-500">₹{totalAmount}</p>
      </div>

      {/* Sales List */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 py-4">Loading sales...</p>
      ) : filteredSales.length > 0 ? (
        <div className="space-y-2">
          {filteredSales.map((sale, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center"
            >
              <Link to={`/getOrderDetails/${sale.order._id}`} className="text-yellow-500 font-semibold underline" >#{sale.order.id}</Link>
              <span>{new Date(sale.date).toLocaleDateString()}</span>
              <span className="font-bold text-green-500">₹{sale.amount}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
          No sales data available
        </p>
      )}
    </div>
    </>
  );
};

export default SalesHistory;
