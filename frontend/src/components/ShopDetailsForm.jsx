import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import PhotosUploader from "./PhotosUploader";
import axios from 'axios';

const ShopDetailsForm = () => {
  const { shopId } = useParams();
  const [shop, setShop] = useState({
    name: '',
    category: '',
    productCategories: [],
    address: {
      addressLine: '',
      pincode: '',
      city: '',
      state: '',
    },
  });
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (shopId) {
      fetchShopDetails();
    }
  }, [shopId]); 

  const fetchShopDetails = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/shop/getShop/${shopId}`,
        { withCredentials: true }
      );

      if (data.success) {
        setShop(data.shop);
        setImages(data.shop.images);
      } else {
        toast.error(data.message);
        setTimeout(() => {
          navigate('/seller');
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching shop details:", error);
      toast.error("Some error occurred!");
      navigate('/seller');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length > 1) {
      setShop((prevShop) => ({
        ...prevShop,
        [keys[0]]: {
          ...prevShop[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setShop((prevShop) => ({
        ...prevShop,
        [name]: value,
      }));
    }
  };

  const editShop = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        'http://localhost:5000/api/shop/edit-shop',
        { shop, shopId, images },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Changes saved!');
        setTimeout(() => {
          navigate('/seller');
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating shop:", error);
      toast.error('Error updating shop!');
    }
  };

  const addShop = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/shop/add-shop',
        { shop, images },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Shop added successfully!');
        setTimeout(() => {
          navigate('/seller');
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding shop:", error);
      toast.error('Error adding shop!');
    }
  };

  const handleAddCategory = () => {
    if (category) {
      setShop({ ...shop, productCategories: [...shop.productCategories, category] });
      setCategory(""); 
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <form onSubmit={shopId ? editShop : addShop} className="bg-white dark:bg-gray-800 p-6 shadow-md rounded-lg space-y-4">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {shopId ? "Edit Shop" : "Add New Shop"}
        </h3>

        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-2">Shop Name</label>
          <input
            type="text"
            name="name"
            value={shop.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-green-500 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-2">Category</label>
          <select
            name="category"
            value={shop.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-green-500 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Select Category</option>
            <option value="Grocery">Grocery</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Bakery" >Bakery</option>
            <option value="Juicery" >Juicery</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div>
        <label className="block text-gray-600 dark:text-gray-300 mb-2">Tags</label>
        <div className="flex space-x-4">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
            placeholder="Enter Tag (Indian, Chinese, Cakes, Sweets)"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Add Tag
          </button>
        </div>
        <div className="mt-2 text-gray-600 dark:text-white">
        Current Tags: {shop && shop?.productCategories && shop?.productCategories.length ? shop?.productCategories.join(", ") : "No tags available"}
        </div>
      </div>

        <PhotosUploader images={images} setImages={setImages} />

        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
          {shopId ? "Edit Shop" : "Add Shop"}
        </button>
      </form>
    </div>
  );
};

export default ShopDetailsForm;
