import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DeliveryBoyLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/delivery/login`, {
        phone,
        password,
      });
      console.log(res.data);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        navigate("/delivery/");
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
