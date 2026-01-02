import React from "react";
import { Link } from "react-router-dom";

const ShopCard = ({ shop }) => {
  return (
    <Link to={`/shop/${shop._id}`} className="block">
      <div className="flex flex-col items-center text-center w-32">
        {/* Image wrapper to FORCE circle */}
        <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300 shadow-sm">
          <img
            src={shop?.images?.[1] || shop?.images?.[0] || "/placeholder.png"}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Discount Badge */}
        {shop?.shopDiscount > 0 && (
          <span className="mt-1 text-green-600 text-lg font-extrabold">
            {shop.shopDiscount}% OFF
          </span>
        )}

        {/* Shop Name */}
        <h3 className="mt-1 text-sm font-semibold leading-tight text-gray-800 dark:text-gray-100 line-clamp-2">
          {shop.name}
        </h3>
      </div>
    </Link>
  );
};

export default ShopCard;
