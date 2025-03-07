import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import EditAddress from "./EditAddress";

const AddressCard = ({ address, deleteAddress, setAsDefault, updateAddress }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
  };

  return (
    <>
      {isEditing === true ? (
        <EditAddress address={address} closeModal={closeEditModal} updateAddress={updateAddress} />
      ) : (
        <>
          <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
            {/* Full Name */}
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {address.fullName}
            </h4>

            {/* Phone Number */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              📞 {address.phone}
            </p>

            {/* Address Line & Area */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              {address.addressLine}, {address.area}
            </p>

            {/* Default Badge or Set as Default */}
            {address.isDefault ? (
              <span className="absolute top-3 right-3 px-3 py-1 text-xs font-medium text-white bg-green-500 dark:bg-green-700 rounded-full">
                Default
              </span>
            ) : (
              <span
                className="absolute top-3 right-3 px-3 py-1 text-lg hover:text-xl font-medium text-yellow-400 cursor-pointer"
                title="Set as default"
                onClick={() => setAsDefault(address._id)}
              >
                <FaStar />
              </span>
            )}

            {/* Buttons */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 dark:bg-green-700 rounded hover:opacity-90 transition"
                onClick={() => handleEdit(address)}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-700 rounded hover:opacity-90 transition"
                onClick={() => deleteAddress(address._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddressCard;
