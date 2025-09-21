import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

export default function Login() {
  const { user, setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({ phone: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const OTP_COOLDOWN = 120; // 2 minutes
  const navigate = useNavigate();

  useEffect(() => {
  const storedExpire = localStorage.getItem("otpExpireTime");
  if (storedExpire) {
    const remaining = Math.floor((storedExpire - Date.now()) / 1000);
    if (remaining > 0) {
      setOtpSent(true);
      setTimeLeft(remaining);
      setCanResend(false);
    } else {
      localStorage.removeItem("otpExpireTime");
    }
  }
}, []);

useEffect(() => {
  if (timeLeft <= 0) {
    setCanResend(true);
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        localStorage.removeItem("otpExpireTime");
        setCanResend(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendOtp = async () => {
    if (!formData.phone) return toast.warn("Enter your phone number first");

    setOtpSent(true);
        setCanResend(false);
        setTimeLeft(OTP_COOLDOWN);

    // try {
    //   const res = await axios.post(
    //     `${process.env.REACT_APP_API_URL}/api/auth/send-login-otp`,
    //     { phone: formData.phone }
    //   );

    //   if (res.data.success) {
    //     toast.success("OTP sent successfully");
    //     setOtpSent(true);
    //     setCanResend(false);
    //     setTimeLeft(OTP_COOLDOWN);

    //     // Store OTP expiration timestamp
    //     const otpExpireTime = Date.now() + OTP_COOLDOWN * 1000;
    //     localStorage.setItem("otpExpireTime", otpExpireTime);
    //   } else {
    //     toast.error(res.data.message);
    //   }
    // } catch (err) {
    //   toast.error("Failed to send OTP");
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.otp) return toast.warn("Fill all fields");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/user-login`,
        { phone: formData.phone, otp: formData.otp },
        { withCredentials: true }
      );

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
  <div className="flex flex-col min-h-screen p-4 bg-white">
    <div className="mx-auto">
      <img
        src="/AppLogo.jpg"
        alt="GullyFoods Logo"
        className="w-full h-32 object-contain"
      />
    </div>

    <div className="flex justify-center items-center flex-1 -mt-32">
      <div className="w-full max-w-md bg-white p-6 shadow-2xl rounded-3xl border-t-4 border-green-500">
        <h2 className="text-2xl text-center text-green-700 font-bold mb-6">
          Login with OTP
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-green-700 mb-1 font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
              placeholder="Enter your mobile number"
            />
          </div>

          {otpSent && (
            <div>
              <label className="block text-green-700 mb-1 font-medium">OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
                className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                placeholder="Enter OTP"
              />
            </div>
          )}

          {!otpSent ? (
            <button
              type="button"
              onClick={sendOtp}
              className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition"
            >
              Send OTP
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition"
              >
                Login
              </button>

              <div className="text-center text-sm text-gray-600">
                {timeLeft > 0 ? (
                  <span>Resend OTP in {timeLeft}s ⏱️</span>
                ) : (
                  <button
                    onClick={sendOtp}
                    className="text-green-700 font-semibold underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        <div className="text-center mt-4 text-gray-800">
          Don’t have an account?
          <Link to="/signup">
            <span className="text-green-700 font-semibold hover:underline ml-1">
              Sign Up
            </span>
          </Link>
        </div>

        {/* T&C and Privacy Policy Links */}
        <div className="text-center mt-4 text-sm text-gray-500">
          By logging in, you agree to our{" "}
          <Link to="/terms" className="text-green-700 underline">
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link to="/policy" className="text-green-700 underline">
            Privacy Policy
          </Link>.
        </div>
      </div>
    </div>
  </div>
</>
  );
}
