import React, { useState, useEffect, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerHeader from "../../components/SellerHeader";
import api from "../../utils/axiosInstance";
import { SellerContext } from "../../context/sellerContext";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { sellerId, ready } = useContext(SellerContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !sellerId) {
      toast.warning("Please login to continue!");
      setTimeout(() => {
        navigate("/seller");
      }, 1000);
    }
  }, [ready, sellerId, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/api/shop/seller-profile`, {
          withCredentials: true,
        });

        if (data?.seller) {
          setUsername(data.seller.username || "");
          setPhone(data.seller.phone || "");
        } else {
          setError("Failed to fetch seller profile. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response) {
          if (err.response.status === 401) {
            setError("You are not authorized. Please login again.");
          } else {
            setError(err.response.data?.message || "Server error occurred.");
          }
        } else {
          setError("Network error. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (ready) fetchProfile();
  }, [ready]);

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!username.trim() || !phone.trim()) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const { data } = await api.put(
        `/api/shop/update-profile`,
        { username, phone },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || "Server error. Try again later."
      );
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword.length < 4) {
      toast.error("Password should be at least 4 characters long.");
      return;
    }

    try {
      const { data } = await api.put(
        `/api/user-profile/change-seller-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          Loading profile...
        </p>
      </div>
    );

  if (error)
    return (
      <>
        <SellerHeader />
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100 dark:bg-gray-900">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />

      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Page Heading */}
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-pink-500 dark:to-yellow-500 mb-6">
          Edit Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-4">Update Profile</h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-200">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-200">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* Password Change Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-200">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-200">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
