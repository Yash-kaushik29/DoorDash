import React from 'react'

const CheckoutSummary = ({
  cartTotalPrice,
  deliveryCharge,
  taxes,
  convenienceFees,
  selectedCoupon,
  totalAmount,
  isFoodOrder,
  discount,
  getGroceryServiceCharge,
}) => {
  return (
    <div className="mb-6 space-y-2">
      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
        Order Summary 🛒
      </h3>

      <div className="flex justify-between">
        <span>Cart Total:</span>
        <span className="text-green-500 font-semibold">₹{cartTotalPrice}</span>
      </div>

      {isFoodOrder ? (
        <>
          <div className="flex justify-between">
            <span>Delivery Fee 🚚:</span>
            <span className="text-green-500 font-semibold">₹{deliveryCharge}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%) 💰:</span>
            <span className="text-green-500 font-semibold">₹{taxes}</span>
          </div>
          {convenienceFees > 0 && (
            <div className="flex justify-between">
              <span>Multi-store Fee ⚡:</span>
              <span className="text-green-500 font-semibold">₹{convenienceFees}</span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <span>Service Charge 📝:</span>
            <span className="text-green-500 font-semibold">
              {getGroceryServiceCharge(cartTotalPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee 🚚:</span>
            <span className="text-green-500 font-semibold">{deliveryCharge}</span>
          </div>
        </>
      )}

      {selectedCoupon && discount > 0 && (
        <div className="flex justify-between text-green-600 font-semibold">
          <span>Coupon ({selectedCoupon.coupon.name}) 🎟️:</span>
          <span>- ₹{discount.toFixed(2)}</span>
        </div>
      )}

      <div className="h-[1px] bg-gray-300 dark:bg-gray-600 my-2"></div>
      <div className="flex justify-between text-xl font-bold">
        <span>Total:</span>
        <span className="text-green-600">₹{(totalAmount - discount).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CheckoutSummary;
