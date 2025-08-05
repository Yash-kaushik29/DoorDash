import React, { useEffect, useState } from "react";
import { Truck, CheckCircle, Clock, DollarSign } from "lucide-react";
import DeliveryBoyHeader from "../../components/DeliveryBoyHeader";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

const DeliveryBoyHome = () => {
  const [orderStats, setOrderStats] = useState({
    assignedOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    commission: 0,
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/delivery/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    try {
      const decoded = jwtDecode(token);
      const deliveryBoyId = decoded.id;

      const fetchOrderStats = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/delivery/orders/${deliveryBoyId}`
          );

          if (isMounted) {
            console.log(response.data)
            setOrderStats(response.data);
          }
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

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  return (
    <div>
      <DeliveryBoyHeader />
      <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Link to="/delivery/orders/all">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Assigned Orders</h2>
                  <p className="text-3xl font-semibold">
                    {orderStats.assignedOrders}
                  </p>
                </div>
                <Truck className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          </Link>

          <Link to="/delivery/orders/delivered">
            <div className="bg-gradient-to-br from-green-500 to-green-700 shadow-lg rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Delivered Orders</h2>
                  <p className="text-3xl font-semibold">
                    {orderStats.deliveredOrders}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          </Link>

          <Link to="/delivery/orders/pending">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Pending Deliveries</h2>
                  <p className="text-3xl font-semibold">
                    {orderStats.pendingOrders}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Commission Earned</h2>
                <p className="text-3xl font-semibold">₹{orderStats.commission}</p>
              </div>
              <DollarSign className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoyHome;
