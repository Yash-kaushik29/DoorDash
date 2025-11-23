import React from "react";
import { toast } from "react-toastify";
import api from "../utils/axiosInstance";

const ProductListCard = ({ product, onToggleStock }) => {
  const deleteProduct = async (productId) => {
    try {
      const {data} = await api.delete(`/api/shop/delete-product/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Product deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4 flex flex-col justify-between gap-2 hover:shadow-lg transition duration-200">
      {/* Product Name */}
      <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
        {product.name}
      </h2>

      {/* Price */}
      <p className="text-green-600 font-bold text-sm">₹{product.price}</p>

      {/* Stock Toggle Button */}
      <button
        onClick={() => onToggleStock(product._id)}
        className={`w-full px-3 py-2 text-sm font-semibold rounded-lg text-white transition duration-150 ${
          product.inStock
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {product.inStock ? "Mark Out of Stock" : "Mark In Stock"}
      </button>

      <button
        onClick={() => deleteProduct(product._id)}
        className={`w-full px-3 py-2 text-sm font-semibold rounded-lg text-white transition duration-150 ${
          product.inStock
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        Delete Product
      </button>

      {/* Edit Button */}
      <a
        href={`/seller/edit-product/${product._id}`}
        className="w-full text-center px-3 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition duration-150"
      >
        Edit
      </a>
    </div>
  );
};

export default ProductListCard;
