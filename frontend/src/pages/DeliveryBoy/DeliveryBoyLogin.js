import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import { registerDeliveryBoyPushToken, requestNotificationPermission } from "../../utils/pushNotifications";

const DeliveryBoyLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem('GullyFoodsDeliveryToken');

  // if(token) {
  //   navigate('/delivery')
  // }

  const handleLogin = async () => {
    setError("");
    try {
      // ✅ Get FCM token before login
      const fcmToken = await requestNotificationPermission();

      const res = await api.post(`/api/delivery/login`, {
        phone,
        password,
        fcmToken,
      });
      console.log(res.data);

      if (res.data.success) {
        localStorage.setItem("GullyFoodsDeliveryToken", res.data.token);
        
        // Register push token for delivery boy
        await registerDeliveryBoyPushToken();
        
        navigate("/delivery");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Delivery Boy Login</h2>
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-green-500 py-2 rounded hover:bg-green-600"
        >
          Login
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default DeliveryBoyLogin;
