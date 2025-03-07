import React from "react";
import { Link } from "react-router-dom";

const ProductListCard = ({ product, onToggleStock }) => {
  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <img
        className="w-full h-48 object-cover"
        src={product.images[0]}
        alt={product.name}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300";
        }}
      />

      {/* Product Details */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
        <p className="text-green-600 font-bold mt-2">₹{product.price}</p>
        <div className="flex space-x-2 mt-4">
          <Link
            to={`/seller/edit-product/${product._id}`}
            className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition duration-150"
          >
            Edit
          </Link>
          <button
            onClick={() => onToggleStock(product._id)}
            className={`flex-1 px-4 py-2 text-white text-sm font-medium rounded transition duration-150 ${
              product.inStock
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {product.inStock ? "Out of Stock" : "In Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;
