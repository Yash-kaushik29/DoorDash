import React from "react";

const CheckoutCoupons = ({
  activeCoupons,
  selectedCoupon,
  setSelectedCoupon,
  cartTotalPrice,
  setDiscount,
}) => {
  const handleSelect = (item) => {
    const coupon = item.coupon;

    if (cartTotalPrice < coupon?.minOrder) return;

    if (selectedCoupon?._id === item._id) {
      setSelectedCoupon(null);
      setDiscount(0);
      return;
    }

    setSelectedCoupon(item);

    let discountAmount = 0;
    if (coupon?.discountType === "PERCENT") {
      discountAmount = (cartTotalPrice * coupon?.discount) / 100;
    } else {
      discountAmount = coupon?.discount;
    }

    setDiscount(discountAmount);
  };

  return (
    <div className="mb-6 space-y-3">
      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
        Available Coupons 🎟️
      </h3>

      <div className="space-y-3">
        {activeCoupons.map((item, index) => {
          const coupon = item.coupon;
          const isSelected = selectedCoupon?._id === item._id;
          const notApplicable = cartTotalPrice < coupon?.minOrder;

          return (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform select-none
                ${
                  notApplicable
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                    : isSelected
                    ? "border-green-500 bg-green-50 scale-105 shadow-lg animate-pulse"
                    : "border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 hover:scale-105"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <p
                  className={`font-bold text-lg ${
                    notApplicable
                      ? "text-gray-400"
                      : "text-gray-900 dark:text-green-500"
                  }`}
                >
                  {coupon?.name}{" "}
                  {!notApplicable && (
                    <span className="ml-2 text-sm text-yellow-500">🎉</span>
                  )}
                </p>

                <p
                  className={`font-semibold ${
                    notApplicable
                      ? "text-gray-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {coupon?.discountType === "PERCENT"
                    ? `${coupon?.discount}% OFF`
                    : `₹${coupon?.discount} OFF`}
                </p>
              </div>

              <p
                className={`text-sm mt-1 ${
                  notApplicable
                    ? "text-gray-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Min Order: ₹{coupon?.minOrder} 📦
              </p>

              <p
                className={`text-sm mt-1 italic ${
                  notApplicable
                    ? "text-gray-400"
                    : "text-gray-500 dark:text-gray-300"
                }`}
              >
                "{coupon?.desc}" 🤩
              </p>

              {notApplicable && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  Shop for ₹{coupon?.minOrder-cartTotalPrice} more to unlock
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutCoupons;
