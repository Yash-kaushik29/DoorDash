import React from 'react';

const CheckoutAddress = ({ userAddresses, selectedAddress, setSelectedAddress, handleSelectAddress, navigate, user }) => {
  if(userAddresses.length === 0)
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>No saved addresses found.</p>
        <button
          onClick={() => navigate(`/user/addresses/${user._id}`)}
          className="mt-2 text-green-500 underline hover:text-green-600"
        >
          ➕ Add a new address
        </button>
      </div>
    );

  return (
    <div className="space-y-3 mb-6">
      <h3 className='text-center text-green-500' >Tap on the address to select it.</h3>
      {userAddresses.map((addr, index) => (
        <div
          key={index}
          onClick={() => handleSelectAddress(addr)}
          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2
            ${
              selectedAddress?._id === addr._id
                ? "border-green-500 bg-green-50 dark:bg-green-900"
                : "border-gray-300 dark:border-gray-600 hover:border-green-400"
            }`}
        >
          <p className="font-semibold text-gray-900 dark:text-white">{addr.fullName}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{addr.phone}</p>
          <p className="text-sm text-gray-800 dark:text-gray-400">{addr.addressLine}, {addr.area}</p>
        </div>
      ))}
    </div>
  );
};

export default CheckoutAddress;