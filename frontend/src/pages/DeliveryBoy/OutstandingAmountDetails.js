import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";

const OutstandingAmountDetails = () => {
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("GullyFoodsDeliveryToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/delivery");
    }

    try {
      const decoded = jwtDecode(token);
      const deliveryBoyId = decoded.id;

      const fetchOutstanding = async () => {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/delivery/outstandingAmounts/${deliveryBoyId}`
          );
          setOutstandingPayments(res.data.outstandingPayments);
        } catch (err) {
          console.error(err);
        }
      };
      fetchOutstanding();
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const filteredPayments =
    filter === "all"
      ? outstandingPayments
      : outstandingPayments.filter((p) => p.status === filter);

  return (
    <>
      <DeliveryBoyHeader />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Outstanding Amount Details
        </h2>

        {/* Filter Buttons */}
        <div className="flex space-x-3 mb-6">
          {["all", "unsettled", "settled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Payments List */}
        <div className="grid gap-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order ID:{" "}
                  <span className="font-bold text-yellow-500">
                    #{payment?.orderId.id}
                  </span>
                </p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ₹{payment.amount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Collected: {new Date(payment.collectedAt).toLocaleString()}
                </p>
                {payment.status === "settled" && payment.settledAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Settled: {new Date(payment.settledAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                {payment.status === "settled" ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No {filter !== "all" ? filter : ""} payments found.
          </p>
        )}
      </div>
    </>
  );
};

export default OutstandingAmountDetails;
