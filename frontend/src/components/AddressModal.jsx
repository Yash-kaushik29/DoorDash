import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
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

  const [isFetchingLocation, setIsFetchingLocation] = useState(true);

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
    [],
  );

  const mapOptions = useMemo(
    () => ({
      styles: isDarkMode ? darkThemeStyles : lightThemeStyles,
      disableDefaultUI: true,
    }),
    [isDarkMode],
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsFetchingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      setIsFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddressData((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          long: pos.coords.longitude,
        }));

        setIsFetchingLocation(false);
      },
      (error) => {
        console.error(error);

        if (error.code === 1) {
          toast.error("Location permission denied");
        } else if (error.code === 2) {
          toast.error("Unable to detect location");
        } else {
          toast.error("Location timeout — try again");
        }

        // fallback center (optional)
        setAddressData((prev) => ({
          ...prev,
          lat: 28.61,
          long: 77.23,
        }));

        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
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

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        `/api/user-profile/saveAddress`,
        { address: { ...addressData } },
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("Address saved");
        onClose();
      }
    } catch {
      toast.error("Failed to save address");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="relative bg-white dark:bg-gray-900 p-6 rounded shadow-md w-full max-w-2xl mx-auto">
        {/* Close */}
        <div
          className="absolute right-4 top-4 text-red-500 font-bold text-2xl cursor-pointer"
          onClick={closeModal}
        >
          ×
        </div>

        {/* ⭐ Step 1 */}
        {step === 1 && (
          <>
            <h2 className="text-xl text-gray-800 dark:text-gray-100 mb-2">
              Pick Delivery Location
            </h2>

            {/* ⭐ Loading UI */}
            {isFetchingLocation && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-3"></div>
                Detecting your location...
              </div>
            )}

            {!isFetchingLocation && isLoaded && addressData.lat && (
              <>
                <div className="mb-2 flex justify-end">
                  <button
                    onClick={getCurrentLocation}
                    className="bg-gray-300 hover:bg-gray-400 text-black text-sm px-3 py-1 rounded"
                  >
                    Get Current Location
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
                  className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Confirm Location
                </button>
              </>
            )}
          </>
        )}

        {/* ⭐ Step 2 */}
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
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={addressData.fullName}
                  onChange={handleInputChange}
                  required
                  className="p-2 border rounded"
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={addressData.phone}
                  onChange={handleInputChange}
                  required
                  className="p-2 border rounded"
                />

                <input
                  type="text"
                  name="addressLine"
                  placeholder="Address Line"
                  value={addressData.addressLine}
                  onChange={handleInputChange}
                  required
                  className="p-2 border rounded"
                />

                <input
                  type="text"
                  name="area"
                  placeholder="Area"
                  value={addressData.area}
                  onChange={handleInputChange}
                  required
                  className="p-2 border rounded"
                />

                <input
                  type="text"
                  name="landmark"
                  placeholder="Landmark"
                  value={addressData.landmark}
                  onChange={handleInputChange}
                  className="p-2 border rounded sm:col-span-2"
                />

                <label className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressData.isDefault}
                    onChange={handleInputChange}
                  />
                  Set as default
                </label>
              </div>

              <button
                type="submit"
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
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
