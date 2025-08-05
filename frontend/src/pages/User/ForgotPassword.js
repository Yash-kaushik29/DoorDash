import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    try {
      const res = await axios.post('/api/auth/send-reset-otp', { phone });
      if (res.data.success) {
        toast.success("Otp sent!");
        setOtpSent(true);
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post('/api/auth/verify-reset-otp', { phone, otp });
      if (res.data.success) {
        setStep(3);
      }
    } catch (err) {
      toast.error("Invalid OTP");
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post('/api/auth/reset-password', {
        phone,
        newPassword,
      });
      if (res.data.success) {
        toast.success("Password reset successfully");
        setStep(1);
        setPhone('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <ToastContainer />
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
          <input
            type="tel"
            placeholder="Enter mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
          <button onClick={sendOtp} className="w-full bg-blue-500 text-white p-2 rounded">
            Send OTP
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-bold mb-4">Verify OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
          <button onClick={verifyOtp} className="w-full bg-green-500 text-white p-2 rounded">
            Verify OTP
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl font-bold mb-4">Reset Password</h2>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
          <button onClick={resetPassword} className="w-full bg-purple-500 text-white p-2 rounded">
            Reset Password
          </button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
