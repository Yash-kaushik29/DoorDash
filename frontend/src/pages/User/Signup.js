import { useContext, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { Turnstile } from "@marsidev/react-turnstile";

export default function Signup() {
  const { setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({ username: "", phone: "" });
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [otpInputs, setOtpInputs] = useState(["", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [captchaDone, setCaptchaDone] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const TOKEN_EXPIRY_DAYS = 14;

  // ------------------- Form Handlers -------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // allow only numbers, max 10 digits
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.phone) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/send-otp`,
        { formData }
      );

      if (response.data.success) {
        toast.success("OTP sent! 🎉");
        setStep("otp");
        setResendCooldown(60); // 60 sec cooldown for resend
      } else {
        toast.error(response.data.message || "Failed to send OTP ❌");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- OTP Handlers -------------------
  useEffect(() => {
    if (otpRefs.current[0]) otpRefs.current[0].focus();
  }, [step]);

  useEffect(() => {
    let interval;
    if (resendCooldown > 0) {
      interval = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpInputs];
    newOtp[index] = value;
    setOtpInputs(newOtp);

    if (value.length === 1 && index < 3) otpRefs.current[index + 1].focus();
    if (value.length === 0 && index > 0) otpRefs.current[index - 1].focus();
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpInputs.join("");
    if (otp.length < 4) {
      toast.error("Enter the complete 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/user-signup`,
        { formData, otp }
      );

      if (response.data.success) {
        toast.success("Signup Successful! 🎉");

        // store token with expiry timestamp
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);
        const tokenData = {
          token: response.data.token,
          expiry: expiry.getTime(),
        };
        localStorage.setItem("GullyFoodsUserToken", JSON.stringify(tokenData));

        setUser(response.data.user);
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error(response.data.message || "OTP verification failed ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "OTP verification failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    handleSubmit(new Event("submit")); // resend OTP
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {step === "form" ? (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
          {/* Logo */}
          <div className="mx-auto my-6">
            <img
              src="/AppLogo.jpg"
              alt="GullyFoods Logo"
              className="w-full h-32 object-contain"
            />
          </div>

          {/* Signup Card */}
          <div className="flex justify-center items-center flex-1 p-4 -mt-32">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 p-6 shadow-2xl rounded-3xl border-t-4 border-green-500"
            >
              <h2 className="text-2xl text-center text-green-700 font-bold mb-6">
                Sign Up
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-green-700 mb-1 font-medium">
                    Name
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-green-700 mb-1 font-medium">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                    placeholder="Enter your mobile number"
                  />
                </div>

                {/* T&C */}
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    required
                    className="accent-green-600"
                  />
                  <span className="text-gray-600 dark:text-gray-300">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-green-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/policy"
                      className="text-green-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                <Turnstile
                  siteKey={process.env.REACT_APP_CF_SITE_KEY}
                  onVerify={() => setCaptchaDone(true)}
                  theme="dark"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !captchaDone}
                  className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Sending OTP..." : "Sign Up"}
                </motion.button>
              </form>

              <div className="text-center mt-4 text-gray-800 dark:text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-green-700 font-semibold hover:underline"
                >
                  Log In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="z-10 max-w-md mx-auto my-[10vh] text-center bg-white dark:bg-gray-900 px-4 sm:px-8 py-10 rounded-xl shadow">
          <header className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Phone Verification</h1>
            <p className="text-[15px] text-slate-500 dark:text-slate-400">
              Enter the code sent to ******{formData.phone.slice(-3)}.
            </p>
          </header>

          <form id="otp-form" onSubmit={verifyOtp} className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              {otpInputs.map((val, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  value={val}
                  maxLength={1}
                  className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 dark:bg-gray-800 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-indigo-100"
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" &&
                      otpInputs[index] === "" &&
                      index > 0
                    ) {
                      otpRefs.current[index - 1].focus();
                    }
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-green-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifying..." : "Verify Account"}
            </button>
          </form>

          <div className="text-sm text-slate-500 mt-4">
            Didn't receive code?{" "}
            <span
              onClick={handleResendOtp}
              className={`font-medium text-green-500 hover:text-green-600 cursor-pointer ${
                resendCooldown > 0 ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
