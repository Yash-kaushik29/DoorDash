import React, { useEffect, useState } from "react";
import { Truck, CheckCircle, Clock, DollarSign } from "lucide-react";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import notificationSound from "../../sound/notificationSound.mp3";
import { ToastContainer, toast } from "react-toastify";
import api from "../../utils/axiosInstance";
import { registerDeliveryBoyPushToken, requestNotificationPermission } from "../../utils/pushNotifications";

const DeliveryBoyHome = () => {
  const [deliveryBoyStats, setDeliveryBoyStats] = useState({
    pendingOrders: 0,
    commission: 0,
  });

  const [canPlayAudio, setCanPlayAudio] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("GullyFoodsDeliveryToken");

  useEffect(() => {
    const unlockAudio = () => {
      const tempAudio = new Audio(notificationSound);
      tempAudio
        .play()
        .then(() => {
          tempAudio.pause();
          tempAudio.currentTime = 0;
          setCanPlayAudio(true);
        })
        .catch((err) => {
          console.warn("Audio unlock failed:", err);
        });

      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    return () => document.removeEventListener("click", unlockAudio);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/delivery/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const deliveryBoyId = decoded.id;

      const fetchOrderStats = async () => {
        try {
          const response = await api.get(
            `/api/delivery/orders/${deliveryBoyId}`
          );

          if (response.data.pendingOrders > 0) {
            if (canPlayAudio) {
              const notificationAudio = new Audio(notificationSound);
              notificationAudio
                .play()
                .catch((err) => console.error("Audio play error:", err));
            }
            toast.info(
              `You have ${response.data.pendingOrders} new deliveries.`
            );
          }
          setDeliveryBoyStats(response.data);
        } catch (error) {
          console.error("Error fetching order stats:", error);
        }
      };

      fetchOrderStats();
    } catch (error) {
      console.error("Invalid token, logging out...");
      localStorage.removeItem("token");
      navigate("/delivery/login");
    }
  }, [token, navigate]);

  return (
    <div>
      <ToastContainer />
      <DeliveryBoyHeader />

      {/* Find Orders Button */}
      <div className="my-6 flex justify-center">
        <Link to="/delivery/orders">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition duration-300">
            🔍 Find Orders
          </button>
        </Link>
      </div>
      <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
           {/* Notification Status Button */}
           <button
            onClick={async () => {
              const status = Notification.permission;
              if (status === "denied") {
                toast.info("Notifications are blocked! Please click the Lock icon in your browser URL bar to Allow them. 🔓", { autoClose: 5000 });
              } else {
                const token = await requestNotificationPermission();
                if (token) {
                  await registerDeliveryBoyPushToken();
                  toast.success("Notifications enabled! 🎉");
                }
              }
            }}
            className={`flex items-center justify-between p-4 rounded-2xl shadow-lg transition transform hover:scale-105 ${Notification.permission === 'granted' ? 'bg-green-600' : Notification.permission === 'denied' ? 'bg-red-600' : 'bg-indigo-600'} text-white`}
          >
            <div className="flex flex-col text-left">
              <span className="font-bold">Notification Status</span>
              <span className="text-xs opacity-90">
                {Notification.permission === 'granted' ? '● ONLINE (Ready)' : Notification.permission === 'denied' ? '● BLOCKED (Tap to fix)' : '● TAP TO ENABLE'}
              </span>
            </div>
            <Clock className="w-8 h-8 opacity-80" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pending Deliveries */}
          <Link to="/delivery/orders/pending">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Pending Deliveries</h2>
                  <p className="text-3xl font-semibold">
                    {deliveryBoyStats.pendingOrders}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          </Link>

          {/* Commission Earned */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Commission Earned</h2>
                <p className="text-3xl font-semibold">
                  ₹{deliveryBoyStats.commission}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-white opacity-80" />
            </div>

            {/* Small link */}
            <div className="mt-2 text-right">
              <Link
                to="/delivery/commissionHistory"
                className="text-sm text-purple-200 underline hover:text-white transition"
              >
                View History →
              </Link>
            </div>
          </div>

          {/* Outstanding Amount */}
          <div className="bg-gradient-to-br from-red-500 to-red-700 shadow-lg rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Outstanding Amount</h2>
                <p className="text-3xl font-semibold">
                  ₹{deliveryBoyStats?.outstandingAmount || 0}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-white opacity-80" />
            </div>

            {/* Small link */}
            <div className="mt-2 text-right">
              <Link
                to="/delivery/outstandingAmountDetails"
                className="text-sm text-red-200 underline hover:text-white transition"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyHome;
