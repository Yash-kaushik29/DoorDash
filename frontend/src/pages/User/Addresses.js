import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../../components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import AddressCard from "../../components/AddressCard";
import AddAddressModal from "../../components/AddressModal";
import { FaHome, FaWhatsapp } from "react-icons/fa";
import api from "../../utils/axiosInstance";

const Addresses = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userAddresses, setUserAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⭐ Location permission state
  const [locationPermission, setLocationPermission] = useState("loading");

  const checkLocationPermission = async () => {
    try {
      if (!navigator.permissions) {
        setLocationPermission("prompt");
        return;
      }

      const result = await navigator.permissions.query({
        name: "geolocation",
      });

      setLocationPermission(result.state);

      result.onchange = () => {
        setLocationPermission(result.state);
      };
    } catch {
      setLocationPermission("prompt");
    }
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationPermission("granted");
        toast.success("Location enabled");
      },
      (error) => {
        console.error(error);

        if (error.code === 1) {
          toast.error("Location permission denied");
        } else if (error.code === 2) {
          toast.error("Unable to detect location. Try again.");
        } else {
          toast.error("Location timeout. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/user-profile/getAddresses`, {
        params: { userId },
      });

      if (response.data.success) {
        setUserAddresses(response.data.addresses);
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

    checkLocationPermission();
    fetchAddresses();
  }, [userId]);

  const closeModal = () => setShowModal(false);

  const deleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/api/user-profile/deleteAddress`, {
        params: { userId, addressId },
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Address deleted successfully!");
        setUserAddresses(data.addresses);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Error deleting address. Please try again later.");
    }
  };

  const setAsDefault = async (addressId) => {
    try {
      const { data } = await api.put(
        `/api/user-profile/setAsDefault`,
        { userId, addressId },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("Default address updated successfully!");
        setUserAddresses(data.addresses);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Error setting default address.");
    }
  };

  const updateAddress = (addressId, updatedData) => {
    setUserAddresses((prev) =>
      prev.map((addr) =>
        addr._id === addressId ? { ...addr, ...updatedData } : addr,
      ),
    );
  };

  return (
    <div className="min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      <main className="container mx-auto px-4 py-8 mb-16 lg:mb-0">
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl overflow-hidden p-6 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 transition-all">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                My Addresses [{userAddresses?.length || 0}]
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Saved delivery locations for faster checkout
              </p>
            </div>

            {locationPermission === "granted" ? (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium"
              >
                <span className="text-base">＋</span>
                Add Address
              </button>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Help us find you! Turn on location so we can deliver your food right to your doorstep 🚀
                </p>

                <button
                  onClick={requestLocation}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Enable Location
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Having trouble adding your address? Our support team is here to help.
            </p>

            <a
              href="https://wa.me/917409565977/?text=Hi, I'm facing issues while adding my address."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 transition"
            >
              <FaWhatsapp className="text-lg" />
              <span className="font-medium text-sm">Contact via WhatsApp</span>
            </a>
          </div>

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