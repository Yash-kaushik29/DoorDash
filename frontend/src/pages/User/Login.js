import { useContext, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

export default function Login() {
  const { user, setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  if (user) {
    navigate("/");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtp = async () => {
    if (!formData.phone) return toast.warn("Enter your phone number first");
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/send-login-otp`, {
        phone: formData.phone,
      });

      if (res.data.success) {
        toast.success("OTP sent successfully");
        setOtpSent(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to send OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/user-login`, {
        phone: formData.phone,
        otp: formData.otp,
      }, { withCredentials: true });

      if (res.data.success) {
        toast.success("Login Successful! 🎉");
        setUser(res.data.user);
        navigate("/");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Login failed");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col min-h-screen p-4 bg-green-200">
        <h1 className="text-center text-4xl font-semibold text-green-600 mb-5">
          Login to App
        </h1>
        <div className="flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white p-6 shadow-xl rounded-2xl"
          >
            <h2 className="text-2xl text-center text-green-600 font-bold mb-4">
              Login with OTP
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-green-600 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-green-300 p-2 rounded focus:outline-none dark:text-gray-800"
                />
              </div>

              {otpSent && (
                <div>
                  <label className="block text-green-600 mb-1">OTP</label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    className="w-full border border-green-300 p-2 rounded focus:outline-none dark:text-gray-800"
                  />
                </div>
              )}

              {!otpSent ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendOtp}
                  className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-800"
                >
                  Send OTP
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-800"
                >
                  Login
                </motion.button>
              )}
            </form>

            <div className="text-center mt-4 text-gray-800">
              Don’t have an account?
              <Link to="/signup">
                <span className="text-green-600 font-semibold hover:underline ml-1">
                  Sign Up
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
