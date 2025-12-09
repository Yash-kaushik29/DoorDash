import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const AccountDetails = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/api/auth/delete-account");
      alert("Your account has been permanently deleted.");
      navigate("/");
    } catch (error) {
      alert("Failed to delete account. Try again.");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-5 transition-colors">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-5">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Account Details
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm">
                Username
              </label>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user?.username || "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm">
                Phone Number
              </label>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {user?.phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
            >
              Delete Account
            </button>
          </div>

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white dark:bg-gray-900 p-5 rounded-lg w-80 shadow-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Confirm Deletion
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action is permanent and will delete all your data.
                </p>

                <div className="flex justify-between mt-5">
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 
                         dark:hover:bg-gray-600 rounded text-gray-800 dark:text-white"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    onClick={handleDeleteAccount}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
