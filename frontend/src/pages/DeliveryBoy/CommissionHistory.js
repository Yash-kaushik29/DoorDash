import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";

const CommissionHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("GullyFoodsDeliveryToken");

    if (!token) {
      navigate("/delivery/login");
      return;
    }

    const decoded = jwtDecode(token);
    const deliveryBoyId = decoded.id;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/delivery/${deliveryBoyId}/commissionHistory`
        );
        const data = await res.json();
        setHistory(data.commissionHistory || []);
      } catch (err) {
        console.error("Error fetching commission history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 dark:text-gray-300">Loading history...</p>
      </div>
    );
  }

  return (
    <>
      <DeliveryBoyHeader />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Commission History
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No commission history found.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((entry, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center transform hover:scale-[1.02] transition-transform"
              >
                {/* Left side - Commission amount */}
                <div className="flex flex-col">
                  <span className="text-lg font-bold">₹{entry.commission}</span>
                  <span className="text-xs opacity-80">Commission</span>
                </div>

                {/* Right side - Date/Time */}
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {new Date(entry.time).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <br />
                  <span className="text-xs opacity-75">
                    {new Date(entry.time).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CommissionHistory;
