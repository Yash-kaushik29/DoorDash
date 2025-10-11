import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import api from "../utils/axiosInstance";

const lightThemeStyles = [];

const darkThemeStyles = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#2e3b4e" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
];

const AddAddressModal = ({ userId, onClose, closeModal }) => {
  const [step, setStep] = useState(1);
  const [addressData, setAddressData] = useState({
    lat: "",
    long: "",
    fullName: "",
    phone: "",
    addressLine: "",
    area: "",
    landmark: "",
    isDefault: false,
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_MAPS_KEY,
  });

  const isDarkMode = useMemo(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    []
  );

  const mapOptions = useMemo(
    () => ({
      styles: isDarkMode ? darkThemeStyles : lightThemeStyles,
      disableDefaultUI: true,
    }),
    [isDarkMode]
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAddressData((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
          }));
        },
        () => {
          setAddressData((prev) => ({
            ...prev,
            lat: 28.61,
            long: 77.23,
          }));
        }
      );
    }
  };

  const handleMapClick = (e) => {
    setAddressData((prev) => ({
      ...prev,
      lat: e.latLng.lat(),
      long: e.latLng.lng(),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    const response = await api.post(
      `/api/user-profile/saveAddress`,
      { address: { ...addressData } },
      { withCredentials: true }
    );
    if (response.data.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="relative bg-white dark:bg-gray-900 p-6 rounded shadow-md w-full max-w-2xl mx-auto">
        {/* Close Button - always visible */}
        <div
          className="absolute right-4 top-4 text-red-500 font-bold text-2xl cursor-pointer"
          onClick={closeModal}
        >
          ×
        </div>

        {/* Step 1 - Map Picker */}
        {step === 1 && isLoaded && addressData.lat && addressData.long && (
          <>
            <h2 className="text-xl text-gray-800 dark:text-gray-100 mb-2">
              Pick Delivery Location
            </h2>
            <div className="mb-2 flex justify-end">
              <button
                onClick={getCurrentLocation}
                className="bg-gray-300 hover:bg-gray-400 text-black text-sm px-3 py-1 rounded"
              >
                Use Current Location
              </button>
            </div>
            <GoogleMap
              mapContainerStyle={{ height: "400px", width: "100%" }}
              center={{
                lat: parseFloat(addressData.lat),
                lng: parseFloat(addressData.long),
              }}
              zoom={15}
              onClick={handleMapClick}
              options={mapOptions}
            >
              <Marker
                position={{
                  lat: parseFloat(addressData.lat),
                  lng: parseFloat(addressData.long),
                }}
              />
            </GoogleMap>
            <button
              onClick={() => setStep(2)}
              disabled={!addressData.lat || !addressData.long}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Confirm Location
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl text-gray-800 dark:text-gray-100 mb-2">
              Enter Address Details
            </h2>
            <form
              onSubmit={handleSave}
              className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-md space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-green-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="User ABC"
                    value={addressData.fullName}
                    onChange={handleInputChange}
                    required
                    className="p-2 border border-green-400 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-green-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="eg. 98******11"
                    value={addressData.phone}
                    onChange={handleInputChange}
                    required
                    className="p-2 border border-green-400 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col sm:col-span-1">
                  <label className="text-sm font-medium text-green-700 mb-1">
                    Address Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    placeholder="House No, Street"
                    value={addressData.addressLine}
                    onChange={handleInputChange}
                    required
                    className="p-2 border border-green-400 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col sm:col-span-1">
                  <label className="text-sm font-medium text-green-700 mb-1">
                    Area / Locality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="area"
                    placeholder="Sector 21"
                    value={addressData.area}
                    onChange={handleInputChange}
                    required
                    className="p-2 border border-green-400 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <label className="text-sm font-medium text-green-700 mb-1">
                    Landmark <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Near Main Market"
                    value={addressData.landmark}
                    onChange={handleInputChange}
                    className="p-2 border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-300 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center space-x-2 sm:col-span-2 mt-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressData.isDefault}
                    onChange={handleInputChange}
                    className="accent-green-600"
                  />
                  <span className="text-sm text-green-700 dark:text-green-200">
                    Set as default address
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition"
              >
                Save Address
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddAddressModal;
