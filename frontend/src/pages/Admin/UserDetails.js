import React, { useState } from 'react';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosInstance';

const UserDetails = () => {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUserDetails = async () => {
    if (!userId) {
      setError('Please enter a valid User ID');
      return;
    }

    setLoading(true);
    setError('');
    setUser(null);

    try {
      const res = await api.get(`/api/admin/user/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('User not found or an error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = user?.orders.slice(indexOfFirstItem, indexOfLastItem);

  // Status Color Logic
  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-500 text-white';
      case 'Shipped':
        return 'bg-blue-500 text-white';
      case 'Delivered':
        return 'bg-green-500 text-white';
      case 'Cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'Paid' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div>
      <AdminHeader />
      <div className="p-4 bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-4xl font-extrabold mb-6 text-gray-100">
            User Details
          </h2>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            />
            <button
              onClick={fetchUserDetails}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fetch User Details
            </button>
          </div>

          {loading && <p className="text-blue-400">Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {user && (
            <div className="mt-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-3xl font-semibold text-gray-100 mb-4">
                {user.username}
              </h3>
              <p className="text-gray-300">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-gray-300">
                <strong>Joined on:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </p>

              <div className="mt-8">
                <h4 className="text-2xl font-semibold text-gray-100 mb-4">
                  Orders
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden shadow-md">
                    <thead>
                      <tr className="bg-gray-700 text-gray-300">
                        <th className="py-3 px-4 text-left">Order ID</th>
                        <th className="py-3 px-4 text-left">Order Status</th>
                        <th className="py-3 px-4 text-left">No. of Items</th>
                        <th className="py-3 px-4 text-left">Total Amount</th>
                        <th className="py-3 px-4 text-left">Payment Status</th>
                        <th className="py-3 px-4 text-left">Order Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders?.map((order, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-700 transition-colors"
                        >
                          <td className="py-3 px-4 text-blue-300 font-bold hover:underline">
                            <Link to={`/viewOrder/${order.id}`}>#{order.id}
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-md text-sm font-semibold ${getOrderStatusColor(order.deliveryStatus)}`}
                            >
                              {order.deliveryStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{order.items?.length}</td>
                          <td className="py-3 px-4 text-green-400 font-semibold">
                            ₹{order.amount}
                          </td>
                          <td className={`py-3 px-4 ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={indexOfLastItem >= user.orders.length}
                    className="px-4 py-2 mx-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
