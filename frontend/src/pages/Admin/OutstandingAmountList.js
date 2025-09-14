import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Phone, User, Wallet } from "lucide-react";
import AdminHeader from "../../components/AdminHeader";

const OutstandingAmountList = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOutstanding = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/outstanding/list`
        );
        setDeliveryBoys(res.data.deliveryBoys);
      } catch (error) {
        console.error("Error fetching outstanding amounts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOutstanding();
  }, []);

  const filteredDeliveryBoys = deliveryBoys.filter(
    (boy) =>
      boy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      boy.phone.includes(searchQuery)
  );

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Delivery Outstanding Amounts
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/2 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Cards */}
        <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeliveryBoys.length === 0 ? (
            <div className="col-span-full text-center py-6 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow">
              No delivery boy found
            </div>
          ) : (
            filteredDeliveryBoys.map((boy) => (
              <div
                key={boy._id}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md p-5 flex flex-col gap-3 hover:shadow-xl transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {boy.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">
                        {boy.phone}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-100 text-sm font-semibold shadow-sm">
                    ₹{boy.outstandingAmount ?? 0}
                  </span>
                </div>
                <div className="flex justify-end">
                  <Link
                    to={`/admin/deliveryBoyDetails/${boy._id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200 transition"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default OutstandingAmountList;
