import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../../components/Navbar";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AddressCard from "../../components/AddressCard";
import { IoIosArrowDropdown } from "react-icons/io";
import AddAddressModal from "../../components/AddressModal";
import { FaHome } from "react-icons/fa";

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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user-profile/getAddresses`,
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
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/user-profile/deleteAddress`,
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
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user-profile/setAsDefault`,
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
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden p-6 max-w-4xl mx-auto">
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your account details and preferences.
          </p>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded font-semibold mx-auto my-4"
            onClick={() => setShowModal(true)}
          >
            ➕ Add New Address
          </button>

          {showModal && (
            <AddAddressModal
              userId={userId}
              closeModal={closeModal}
              onClose={() => {
                setShowModal(false);
                fetchAddresses(); // Refresh list after save
              }}
            />
          )}

          {/* User's Saved Addresses */}
          {loading ? (
            <div className="flex mt-16 flex-col justify-center items-center ">
              <FaHome className="text-green-500" />
              <p>Fetching saved Addresses...</p>
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
