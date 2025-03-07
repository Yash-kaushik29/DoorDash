import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import { Link } from 'react-router-dom';
import debounce from 'lodash.debounce';  // Add debounce for API calls

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products?search=${search}&page=${page}`);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      } else {
        setError(res.data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input to avoid excessive API calls
  const debouncedFetchProducts = useCallback(debounce(fetchProducts, 500), [search, page]);

  useEffect(() => {
    debouncedFetchProducts();
    return () => debouncedFetchProducts.cancel();
  }, [search, page]);  

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);  // Reset page when search changes
  };

  return (
    <div>
      <AdminHeader />
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">All Products</h2>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
          className="mb-4 p-2 border rounded w-full dark:bg-gray-800 dark:text-white"
        />

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading products...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No products found.</p>
        ) : (
          <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 rounded-md">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Product Name</th>
                <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Price</th>
                <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Stock Status</th>
                <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Seller</th>
                <th className="py-2 px-4 text-left text-gray-800 dark:text-gray-200">Details</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-200">{product.name}</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-200">₹{product.price}</td>
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-200">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </td>
                  <td className="py-2 px-4 text-gray-800 dark:text-gray-200">{product.seller?.username || 'N/A'}</td>
                  <td className="py-2 px-4">
                    <Link className="text-blue-500 hover:underline dark:text-blue-400">View Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
