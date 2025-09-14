import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { User, Phone, Wallet } from "lucide-react";
import AdminHeader from "../../components/AdminHeader";

const DeliveryBoyDetails = () => {
  const { deliveryBoyId } = useParams();
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  ); 
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchDeliveryBoy = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/deliveryBoy/${deliveryBoyId}`
      );
      setDeliveryBoy(res.data.deliveryBoy);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoy();
  }, [deliveryBoyId]);

  const handleClearOutstanding = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/deliveryBoy/clearOutstanding/${deliveryBoyId}`
      );
      alert(
        "Outstanding amount cleared and all unsettled orders marked as settled!"
      );
      setShowConfirm(false);
      fetchDeliveryBoy(); // refresh data
    } catch (error) {
      console.error(error);
      alert("Failed to clear outstanding amount");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!deliveryBoy)
    return <div className="p-6 text-center">Delivery Boy not found</div>;

  // Calculate total commission for selected date
  const totalCommissionForDate = (deliveryBoy.commissionHistory || [])
    .filter((c) => new Date(c.time).toISOString().slice(0, 10) === selectedDate)
    .reduce((sum, c) => sum + c.commission, 0);

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          {deliveryBoy.name} Details
        </h1>

        {/* Delivery Boy Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {deliveryBoy.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {deliveryBoy.phone}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Outstanding: ₹{deliveryBoy.outstandingAmount ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`font-semibold ${
                deliveryBoy.isAvailable ? "text-green-600" : "text-red-600"
              }`}
            >
              {deliveryBoy.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Date Picker */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
            Select Date for Commission:
          </label>
          <input
            type="date"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Total Commission for selected date */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Total Commission for {selectedDate}
          </h2>
          <p className="text-2xl font-bold text-green-500">
            ₹{totalCommissionForDate}
          </p>
        </div>

        {/* Clear Outstanding Amount Button */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() => setShowConfirm(true)}
          >
            Clear Outstanding Amount
          </button>

          {showConfirm && (
            <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-700">
              <p className="mb-2 text-gray-800 dark:text-gray-200">
                Are you sure you want to reset outstanding amount to 0?
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={handleClearOutstanding}
                >
                  Yes, Clear
                </button>
                <button
                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Outstanding Payments List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Outstanding Payments
          </h2>
          {deliveryBoy.outstandingPayments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">
              No outstanding payments
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                    <th className="p-2 text-gray-700 dark:text-gray-300">
                      Order ID
                    </th>
                    <th className="p-2 text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="p-2 text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="p-2 text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryBoy.outstandingPayments.map((p, idx) => (
                    <tr
                      key={p._id}
                      className={`${
                        idx % 2 === 0
                          ? "bg-gray-50 dark:bg-gray-800"
                          : "bg-white dark:bg-gray-700"
                      }`}
                    >
                      <td className="p-2 text-yellow-700 dark:text-yellow-400">
                        #{p.orderId.id}
                      </td>
                      <td className="p-2 text-gray-800 dark:text-gray-200">
                        ₹{p.amount}
                      </td>
                      <td className="p-2">
                        <span
                          className={`font-semibold ${
                            p.status === "settled"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-2 text-gray-800 dark:text-gray-200">
                        {new Date(p.collectedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DeliveryBoyDetails;
