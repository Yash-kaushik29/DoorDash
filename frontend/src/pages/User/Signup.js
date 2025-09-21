import { useContext, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

export default function Signup() {
  const { user, setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
  });
  const [step, setStep] = useState("form");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    const otpInputs = e.target.querySelectorAll("input[type='text']");
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    if (otp.length < 4) {
      toast.error("Please enter the complete 4-digit OTP");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/user-signup`,
        { formData, otp },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Signup Successful! 🎉");
        setUser(response.data.user);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.error(response.data.message + " ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Signup Failed. Please try again. ❌"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. ❌");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/send-otp`,
        { formData },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Otp sent! 🎉");
        setStep("otp");
      } else {
        toast.error(response.data.message + " ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Signup Failed. Please try again. ❌"
      );
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {step === "form" ? (
        <div className="flex flex-col min-h-screen bg-white">
          {/* Logo at top */}
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
              className="w-full max-w-md bg-white p-6 shadow-2xl rounded-3xl border-t-4 border-green-500"
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
                    className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                    placeholder="Enter your mobile number"
                  />
                </div>

                {/* T&C & Privacy */}
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    required
                    className="accent-green-600"
                  />
                  <span className="text-gray-600 dark:text-gray-700">
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

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition"
                >
                  Sign Up
                </motion.button>
              </form>

              <div className="text-center mt-4 text-gray-800">
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
        <div className="z-10 max-w-md mx-auto my-[10vh] text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
          <header className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Phone Verification</h1>
            <p className="text-[15px] text-slate-500">
              Enter the code sent to *******
              {formData.phone.slice(-3)}.
            </p>
          </header>
          <form id="otp-form" onSubmit={verifyOtp}>
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-green-400 focus:ring-2 focus:ring-indigo-100"
                  pattern="[a-zA-Z0-9]*"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length === 1 && e.target.nextSibling) {
                      e.target.nextSibling.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" &&
                      e.target.value === "" &&
                      e.target.previousSibling
                    ) {
                      e.target.previousSibling.focus();
                    }
                  }}
                />
              ))}
            </div>
            <div className="max-w-[260px] mx-auto mt-4">
              <button
                type="submit"
                className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-green-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-green-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150"
              >
                Verify Account
              </button>
            </div>
          </form>
          <div className="text-sm text-slate-500 mt-4">
            Didn't receive code?{" "}
            <span
              onClick={handleSubmit}
              className="font-medium text-green-500 hover:text-green-600 cursor-pointer"
            >
              Resend
            </span>
          </div>
        </div>
      )}
    </>
  );
}
