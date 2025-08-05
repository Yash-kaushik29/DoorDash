import axios from "axios";
import React, { useContext, useState } from "react";
import { UserContext } from "../context/userContext";
import { toast } from "react-toastify";

const EditAddress = ({ address, closeModal, updateAddress }) => {
  const [formData, setFormData] = useState({
    fullName: address.fullName || "",
    phone: address.phone || "",
    addressLine: address.addressLine || "",
    area: address.area || "",
    landmark: address.landmark || "",
  });

  const { user } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const editAddress = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user-profile/editAddress`,
        {
          userId: user._id,
          addressId: address._id,
          formData, // formData doesn't include lat/lng — backend should preserve them
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        updateAddress(address._id, { ...address, ...formData });
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Edit Address
        </h3>
        <form onSubmit={editAddress}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Address Line */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address Line
            </label>
            <input
              type="text"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Area Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Area
            </label>
            <input
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Landmark */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Landmark
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAddress;
