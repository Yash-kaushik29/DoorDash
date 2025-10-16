import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhotosUploader from "./PhotosUploader";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosInstance";

const ProductForm = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({
    name: "",
    price: "",
    dietType: "Veg",
    categories: [],
    images: [],
    shop: "",
    inStock: true,
    description: "",
  });
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("GullyFoodsSellerToken");

  // Fetch Product Details if Editing
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/api/shop/getProduct/${productId}`,
        { withCredentials: true }
      );

      if (data.success) {
        setProduct(data.product);
        setImages(data.product.images);
      } else {
        toast.error(data.message);
        setTimeout(() => {
          navigate("/seller/my-products");
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Some error occurred while fetching product details.");
      navigate("/seller/my-products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddCategory = () => {
    if (category) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        categories: [...prevProduct.categories, category],
      }));
      setCategory("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (
      !product.name ||
      !product.price ||
      !product.dietType ||
      images.length === 0
    ) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = productId
        ? `/api/shop/edit-product`
        : `/api/shop/add-product`;

      const { data } = await api({
        method: productId ? "put" : "post",
        url: apiUrl,
        data: { product, productId, images },
        withCredentials: true
      });

      if (data.success) {
        toast.success(
          productId ? "Changes saved!" : "Product added successfully!"
        );
        setTimeout(() => {
          navigate(`/seller/my-products`);
        }, 2000);
        setImages([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(error.response?.data?.message || "Error submitting product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <form
        onSubmit={handleSubmit}
        className="p-6 shadow-md rounded-lg space-y-4 bg-white dark:bg-gray-800"
      >
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {productId ? "Edit Product" : "Add New Product"}
        </h3>

        {/* Product Name */}
        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="string"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
            required
          />
        </div>

        {/* Diet-Type */}

        {/* Categories */}
        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
              placeholder="Enter Category"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            >
              Add Category
            </button>
          </div>
          <div className="mt-2 text-gray-600 dark:text-white">
            Current Tags:{" "}
            {product.categories.length
              ? product.categories.join(", ")
              : "No tags available"}
          </div>
        </div>

        {/* Images */}
        <PhotosUploader images={images} setImages={setImages} upload={false} />

        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          disabled={loading}
        >
          {loading
            ? productId
              ? "Saving Changes..."
              : "Adding Product..."
            : productId
            ? "Save Changes"
            : "Add Product"}
        </button>
      </form>
    </>
  );
};

export default ProductForm;
