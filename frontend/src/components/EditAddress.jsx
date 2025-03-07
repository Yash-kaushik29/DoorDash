import axios from "axios";
import React, { useContext, useState } from "react";
import { UserContext } from "../context/userContext";
import { toast } from "react-toastify";

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

const EditAddress = ({ address, closeModal, updateAddress }) => {
  const [formData, setFormData] = useState({
    fullName: address.fullName,
    phone: address.phone,
    addressLine: address.addressLine,
    area: address.area,
  });
  const { user } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const editAddress = async (e) => {
    e.preventDefault();
    const { data } = await axios.post(
      "http://localhost:5000/api/user-profile/editAddress",
      { userId: user._id, addressId: address._id, formData },
      { withCredentials: true }
    );

    if (data.success) {
      toast.success(data.message);
      updateAddress(address._id, formData)
    } else {
      toast.error(data.message);
    }

    closeModal();
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
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Address Line */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Address Line
            </label>
            <input
              type="text"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Area Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Area
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="" disabled>Select Area</option>
              {areas.map((area, index) => (
                <option key={index} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={closeModal}
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
