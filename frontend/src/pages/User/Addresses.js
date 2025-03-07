import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../../components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AddressCard from "../../components/AddressCard";
import { IoIosArrowDropdown } from "react-icons/io";

const areas = [
  { name: "Jubilant" },
  { name: "Atal ji Nagar" },
  { name: "Choupla, Gajraula" },
  { name: "Sultan Nagar" },
  { name: "MDA Colony" },
  { name: "Bhanpur" },
  { name: "Railway Station" },
  { name: "Mansarovar Colony" },
  { name: "Basti" },
  { name: "Atarpura" },
  { name: "TEVA Ltd." },
  { name: "KhadGujjar Road" },
  { name: "Saraswati Vihar" },
  { name: "Salempur Road" },
  { name: "Venkateshwara Institute" },
];

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
  const [showAreas, setShowAreas] = useState(false);
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    try {
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
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/user/profile");
    }

    fetchAddresses();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveAddress = async (e) => {
    e.preventDefault();

    try {
      if (
        !address.fullName ||
        !address.addressLine ||
        !address.phone || !address.area
      ) {
        toast.warning("Please fill all the fields!");
      } else if(address.phone.length !== 10) {
        toast.warning("Please enter a 10 digit phone number!")
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/user-profile/saveAddress`,
          { userId, address },
          { withCredentials: true }
        );
  
        if (data.success) {
          toast.success("Address saved Successfully!");
          setAddress({
            fullName: "",
            addressLine: "",
            phone: "",
            isDefault: false,
          });
          userAddresses.push(address)
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Some error occured");
    }
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

          {/* Profile Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Address Section */}
            <div className="flex flex-col bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md w-full">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Your Address
              </h3>
              <form className="space-y-4" onSubmit={saveAddress} method="post">
                <div>
                  <label className="block font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={address.fullName}
                    onChange={(e) =>
                      setAddress({ ...address, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 bg-gray-100 dark:bg-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 bg-gray-100 dark:bg-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Address Line</label>
                  <input
                    type="text"
                    name="addressLine"
                    value={address.addressLine}
                    onChange={(e) =>
                      setAddress({ ...address, addressLine: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 bg-gray-100 dark:bg-gray-700"
                    required
                  />
                </div>

                {/* Area Dropdown */}
                <div className="relative">
                  <label className="block font-medium mb-2">Area</label>
                  <button
                    type="button"
                    onClick={() => setShowAreas(!showAreas)}
                    className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-between"
                  >
                    {address.area || "Select Area"}
                    <IoIosArrowDropdown className="text-xl" />
                  </button>

                  {showAreas && (
                    <div className="absolute w-full bg-white dark:bg-gray-700 border rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                      {areas.map((area) => (
                        <p
                          key={area.name}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => {
                            setAddress({ ...address, area: area.name });
                            setShowAreas(false);
                          }}
                        >
                          {area.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Default Address Checkbox */}
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="defaultAddress"
                    className="w-5 h-5"
                    checked={address.isDefault}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        isDefault: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="defaultAddress" className="ml-2 font-medium">
                    Set as Default Address
                  </label>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition"
                >
                  Save Address
                </button>
              </form>
            </div>
          </div>

          {/* User's Saved Addresses */}
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
        </div>
      </main>
    </div>
  );
};

export default Addresses;
