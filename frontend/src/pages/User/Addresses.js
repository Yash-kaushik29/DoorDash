import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../../components/Navbar";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AddressCard from "../../components/AddressCard";
import { IoIosArrowDropdown } from "react-icons/io";
import AddAddressModal from "../../components/AddressModal";
import { FaHome } from "react-icons/fa";
import api from "../../utils/axiosInstance";

const Addresses = () => {
  const { userId } = useParams();
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    area: "",
    isDefault: false,
  });
  const [userAddresses, setUserAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/user-profile/getAddresses`,
        {
          params: { userId },
        }
      );

      if (response.data.success) {
        setUserAddresses(response.data.addresses);
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/user/profile");
    }

    fetchAddresses();
  }, [userId]);

  const closeModal = () => {
    setShowModal(false);
  };

  const deleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(
        `/api/user-profile/deleteAddress`,
        {
          params: { userId, addressId },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Address deleted successfully!");
        setUserAddresses(data.addresses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error deleting address. Please try again later.");
    }
  };

  const setAsDefault = async (addressId) => {
    try {
      const { data } = await api.put(
        `/api/user-profile/setAsDefault`,
        {
          userId,
          addressId,
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Default address updated successfully!");
        setUserAddresses(data.addresses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error setting default address. Please try again later.");
    }
  };

  const updateAddress = (addressId, updatedData) => {
    setUserAddresses((prevAddresses) =>
      prevAddresses.map((addr) =>
        addr._id === addressId ? { ...addr, ...updatedData } : addr
      )
    );
  };

  return (
    <div className="min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      <main className="container mx-auto px-4 py-8 mb-16 lg:mb-0">
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl overflow-hidden p-6 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 transition-all">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-600">
                My Addresses
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Saved delivery locations for faster checkout.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              <span className="text-lg">➕</span> Add New
            </button>
          </div>

          {/* Add Address Modal */}
          {showModal && (
            <AddAddressModal
              userId={userId}
              closeModal={closeModal}
              onClose={() => {
                setShowModal(false);
                fetchAddresses();
              }}
            />
          )}

          {/* Loading / Empty / Grid */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-600 dark:text-gray-400">
              <FaHome className="text-5xl text-green-500 mb-4 animate-bounce" />
              <p>Fetching saved addresses...</p>
            </div>
          ) : userAddresses.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-600 dark:text-gray-400">
              <FaHome className="text-5xl text-green-400 mb-4" />
              <p className="font-medium">No saved addresses yet</p>
              <p className="text-sm">Add one to make checkout easier 🚀</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {userAddresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  deleteAddress={deleteAddress}
                  setAsDefault={setAsDefault}
                  updateAddress={updateAddress}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Addresses;
