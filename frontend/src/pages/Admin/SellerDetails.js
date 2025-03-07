import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from "../../components/AdminHeader";
import { useParams } from "react-router-dom";

const SellerDetails = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const sellerRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/seller/${sellerId}`
        );
        setSeller(sellerRes.data);

        const productsRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/seller/${sellerId}/products`
        );
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Error fetching seller details:", err);
      }
    };

    fetchDetails();
  }, [sellerId]);

  if (!seller) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AdminHeader />
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition duration-300 ease-in-out">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Seller Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Username:</strong> {seller.username}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Email:</strong> {seller.email}
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2 text-gray-800 dark:text-gray-100">
          Shop Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Shop Name:</strong> {seller.shop.name}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Category:</strong> {seller.shop.category}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>Status:</strong>
          <span
            className={`px-2 py-1 rounded-full ${
              seller.shop.isOpen ? "text-green-500" : "text-red-500"
            }`}
          >
            {seller.shop.isOpen ? "Open" : "Closed"}
          </span>
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-2 text-gray-800 dark:text-gray-100">
          Products
        </h2>
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-700">
              <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">
                Product Name
              </th>
              <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">
                Price
              </th>
              <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">
                Stock Status
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
              >
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {product.name}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {product.price}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-white ${
                      product.inStock ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerDetails;
