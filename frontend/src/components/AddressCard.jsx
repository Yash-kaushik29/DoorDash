import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import EditAddress from "./EditAddress";

const AddressCard = ({ address, deleteAddress, setAsDefault, updateAddress }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const closeEditModal = () => setIsEditing(false);

  return (
    <>
      {isEditing ? (
        <EditAddress
          address={address}
          closeModal={closeEditModal}
          updateAddress={updateAddress}
        />
      ) : (
        <div
          className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md 
          hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-in-out"
        >
          {/* Default Badge or Star */}
          {address.isDefault ? (
            <span className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-green-500 dark:bg-green-700 rounded-full shadow-sm">
              <FaStar className="text-yellow-300" /> Default
            </span>
          ) : (
            <span
              className="absolute top-3 right-3 text-lg text-gray-400 hover:text-yellow-400 transition cursor-pointer"
              title="Set as default"
              onClick={() => setAsDefault(address._id)}
            >
              <FaStar />
            </span>
          )}

          {/* Full Name */}
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            {address.fullName}
          </h4>

          {/* Phone Number */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            📞 {address.phone}
          </p>

          {/* Address Line & Area */}
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {address.addressLine}, {address.area}
          </p>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-5">
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 dark:bg-green-700 rounded-lg shadow-sm hover:bg-green-600 dark:hover:bg-green-600 transition"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-700 rounded-lg shadow-sm hover:bg-red-600 dark:hover:bg-red-600 transition"
              onClick={() => deleteAddress(address._id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddressCard;
