import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerHeader from "../../components/SellerHeader";

const EditProfile = () => {
  const [sellerId, setSellerId] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("GullyFoodsSellerToken");

  // Fetch seller profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/shop/seller-profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSellerId(data.seller._id);
        setUsername(data.seller.username);
        setPhone(data.seller.phone);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile details.");
      }
    };
    fetchProfile();
  }, []);

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/shop/update-profile`,
        { username, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
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
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user-profile/change-seller-password/${sellerId}`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    }
  };

  if (loading) return <div>Loading...</div>;

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
