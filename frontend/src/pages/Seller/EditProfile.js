import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerHeader from "../../components/SellerHeader";

const EditProfile = () => {
  const [sellerId, setSellerId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch current profile details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/shop/seller-profile",
          { withCredentials: true }
        );

        setSellerId(data.seller._id);
        setUsername(data.seller.username);
        setEmail(data.seller.email);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
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
        "http://localhost:5000/api/shop/update-profile",
        { username, email },
        { withCredentials: true }
      );
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    console.log(sellerId)
    if (newPassword.length < 4) {
      toast.error("Password should be at least 4 characters long.");
      return;
    }

    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/user-profile/change-seller-password/${sellerId}`,
        {
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      console.log(data)
      if (data.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    } catch (error) {
        console.log(error)
      toast.error("An error occurred.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      <SellerHeader />
      <div className="container mx-auto p-4 transition duration-500 ease-in-out">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-pink-500 dark:to-yellow-500 mb-6">
          Edit Profile
        </h1>

        <form
          onSubmit={handleProfileUpdate}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-3xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Update Details
          </h2>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg shadow-md border dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg shadow-md border dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300"
          >
            Update Profile
          </button>
        </form>

        <form
          onSubmit={handlePasswordChange}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-3xl p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Change Password
          </h2>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg shadow-md border dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg shadow-md border dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
