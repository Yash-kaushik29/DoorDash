import React from "react";

const CheckoutSummary = ({
  cartTotalPrice,
  deliveryCharge,
  distance,
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
        <span className="text-green-500 font-semibold">
          ₹{cartTotalPrice.toFixed(2)}
        </span>
      </div>

      {isFoodOrder ? (
        <>
          <div className="flex justify-between">
            <span>Delivery Fee {distance > 0 && (<span>({distance.toFixed(2)} Km)</span>)} 🚚:</span>
            <span className="text-green-500 font-semibold">{deliveryCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%) 💰:</span>
            <span className="text-green-500 font-semibold">
              ₹{taxes.toFixed(2)}
            </span>
          </div>
          {convenienceFees > 0 && (
            <div className="flex justify-between">
              <span>Multi-store Fee ⚡:</span>
              <span className="text-green-500 font-semibold">
                ₹{convenienceFees.toFixed(2)}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <span>Service Charge 📝:</span>
            <span className="text-green-500 font-semibold">
              {getGroceryServiceCharge(cartTotalPrice).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee {distance > 0 && (<span>({distance.toFixed(2)} Km)</span>)} 🚚:</span>
            <span className="text-green-500 font-semibold">{deliveryCharge.toFixed(2)}</span>
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
        <span className="text-green-600">
          ₹{(totalAmount - discount).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CheckoutSummary;
