import React from "react";

const CheckoutCoupons = ({
  activeCoupons,
  selectedCoupon,
  setSelectedCoupon,
  cartTotalPrice,
  setDiscount,
}) => {
  const handleSelect = (item) => {
    setSelectedCoupon(item);

    const coupon = item.coupon;
    let discountAmount = 0;

    if (cartTotalPrice >= coupon.minOrder) {
      if (coupon.discountType === "PERCENT") {
        discountAmount = (cartTotalPrice * coupon.discount) / 100;
      } else {
        discountAmount = coupon.discount;
      }
    } else {
      discountAmount = 0;
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

          return (
            <div
              key={index}
              onClick={() => handleSelect(item)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform
          ${
            isSelected
              ? "border-green-500 bg-green-50 scale-105 shadow-lg animate-bounce"
              : "border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 hover:scale-105"
          }
        `}
            >
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg text-gray-900 dark:text-green-500">
                  {coupon.name}{" "}
                  <span className="ml-2 text-sm text-yellow-500">🎉</span>
                </p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {coupon.discountType === "PERCENT"
                    ? `${coupon.discount}% OFF`
                    : `₹${coupon.discount} OFF`}
                </p>
              </div>
              {coupon.minOrder > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Min Order: ₹{coupon.minOrder} 📦
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 italic">
                "{coupon.desc}" 🤩
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutCoupons;
