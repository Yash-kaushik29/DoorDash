import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";
import {
  ShoppingBag,
  UserCheck,
  DollarSign,
  Store,
  Package,
  ClipboardList,
  User,
  HelpCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/admin/dashboard-overview", {
        withCredentials: true,
      });

      if (response.data.success) {
        setOverview(response.data.data);
      } else {
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Failed to fetch overview:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-black dark:bg-gray-900 dark:text-white min-h-screen">
      <AdminHeader />

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Card */}
          <Link to="/admin/all-orders">
            <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Orders</h2>
                <ShoppingBag className="w-10 h-10 opacity-80" />
              </div>
              {overview ? (
                <div className="mt-4 space-y-2">
                  <p>
                    Total Orders:{" "}
                    <span className="font-bold">{overview.orders.total}</span>
                  </p>
                  <p>
                    Pending:{" "}
                    <span className="font-bold">{overview.orders.pending}</span>
                  </p>
                  <p>
                    Delivered:{" "}
                    <span className="font-bold">
                      {overview.orders.delivered}
                    </span>
                  </p>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </Link>

          {/* Delivery Boys Card */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Delivery Boys</h2>
              <UserCheck className="w-10 h-10 opacity-80" />
            </div>
            {overview ? (
              <div className="mt-4 space-y-2">
                <p>
                  Active:{" "}
                  <span className="font-bold">
                    {overview.deliveryBoys.active}
                  </span>
                </p>
                <p>
                  Available:{" "}
                  <span className="font-bold">
                    {overview.deliveryBoys.available}
                  </span>
                </p>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          {/* Sales Card */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Sales</h2>
              <DollarSign className="w-10 h-10 opacity-80" />
            </div>
            {overview ? (
              <div className="mt-4 space-y-2">
                <p>
                  Total Sales:{" "}
                  <span className="font-bold">₹{overview.sales.total}</span>
                </p>
                <p>
                  Today:{" "}
                  <span className="font-bold">₹{overview.sales.today}</span>
                </p>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Shop Details */}
          <Link to="/admin/getSellers">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Sellers Details</h2>
                <Store className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </Link>

          {/* Product Details */}
          <Link to="/admin/adminProducts">
            <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Product Details</h2>
                <Package className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </Link>

          {/* New Divs */}
          <Link to="/viewOrder/:">
            <div className="flex justify-between bg-gradient-to-br from-teal-400 to-teal-600 text-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <ClipboardList className="w-8 h-8 opacity-80" />
            </div>
          </Link>

          <Link to="/admin/userDetails">
            <div className="flex justify-between bg-gradient-to-br from-indigo-400 to-indigo-600 text-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h2 className="text-xl font-semibold">User Details</h2>
              <User className="w-8 h-8 opacity-80" />
            </div>
          </Link>

          <div className="flex justify-between bg-gradient-to-br from-pink-400 to-pink-600 text-white p-4 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <h2 className="text-xl font-semibold">Customer Queries</h2>
            <HelpCircle className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
