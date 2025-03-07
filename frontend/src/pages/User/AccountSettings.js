import React, { useContext, useState } from "react";
import Navbar from "../../components/Navbar";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const AccountSettings = () => {
  const { user, setUser, ready } = useContext(UserContext);
  const [updatedUser, setUpdatedUser] = useState({
    name: user?.name || "",
    password: "",
    newPassword: "",
  });
  const navigate = useNavigate();

  if (ready && !user) {
    navigate("/");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/user-profile/updateDetails/${user._id}`,
        {
          name: updatedUser.name,
          email: updatedUser.email,
        },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Profile updated successfully!");
        setUser((prev) => ({
          ...prev,
          name: updatedUser.name,
          email: updatedUser.email,
        }));
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (updatedUser.newPassword.length < 6) {
      toast.error("Password should be at least 6 characters long.");
      return;
    }

    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/user-profile/change-password/${user._id}`,
        {
          password: updatedUser.password,
          newPassword: updatedUser.newPassword,
        },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Password changed successfully!");
        setUpdatedUser({ ...updatedUser, password: "", newPassword: "" });
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };

  const handleLogout = async () => {
    const { data } = await axios.get(
      "http://localhost:5000/api/user-profile/logout",
      {
        withCredentials: true,
      }
    );

    if (data.success) {
      toast.success("You have been logged out!");
      setTimeout(() => {
        navigate("/");
        setUser(null);
      }, 1000);
    } else {
      toast.error("Failed to logout!");
    }
  };

  if (!ready) return <>Loading...</>;

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex justify-center items-start p-4 pb-16">
        <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-center mb-6">Account Settings</h2>

          {/* Profile Update Form */}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <h3 className="text-xl font-semibold">Profile Information</h3>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={updatedUser.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={updatedUser.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-800"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition"
            >
              Save Changes
            </button>
          </form>

          <hr className="my-6 border-gray-300 dark:border-gray-600" />

          {/* Password Change Form */}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h3 className="text-xl font-semibold">Change Password</h3>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="password"
                value={updatedUser.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={updatedUser.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-800"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition"
            >
              Change Password
            </button>
          </form>

          <hr className="my-6 border-gray-300 dark:border-gray-600" />

          {/* Logout Button */}
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;
