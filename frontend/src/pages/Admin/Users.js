import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/api/admin/users?page=${page}&limit=25&sortBy=${sortBy}`
      );
      setUsers(data.users);
      setTotal(data.totalUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy]);

  return (
    <>
      <AdminHeader />
      <div className="p-6 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Users: {total}</h2>

        <div className="flex gap-4 mb-5">
          <button
            onClick={() => setSortBy("food")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sort by FoodCart ↓
          </button>
          <button
            onClick={() => setSortBy("grocery")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Sort by GroceryCart ↓
          </button>
          <button
            onClick={() => setSortBy("")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Clear Sort
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border dark:border-gray-700 rounded-lg shadow-md">
          <table className="min-w-full text-left">
            <thead className="bg-gray-200 dark:bg-gray-800 dark:text-gray-100">
              <tr>
                <th className="p-3 border dark:border-gray-700">Name</th>
                <th className="p-3 border dark:border-gray-700">Phone</th>
                <th className="p-3 border dark:border-gray-700 text-center">
                  FoodCart
                </th>
                <th className="p-3 border dark:border-gray-700 text-center">
                  GroceryCart
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                users.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => navigate(`/admin/userDetails/${u._id}`)}
                    className="border dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <td className="p-3 border dark:border-gray-700">
                      {u.username}
                    </td>
                    <td className="p-3 border dark:border-gray-700">
                      {u.phone}
                    </td>
                    <td className="p-3 border dark:border-gray-700 text-center">
                      {u.foodCartLength ?? u.foodCart?.length ?? 0}
                    </td>
                    <td className="p-3 border dark:border-gray-700 text-center">
                      {u.groceryCartLength ?? u.groceryCart?.length ?? 0}
                    </td>
                  </tr>
                ))}

              {loading && (
                <tr>
                  <td className="p-4 text-center" colSpan="4">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex gap-4 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Previous
          </button>

          <span className="px-4 py-2">Page {page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Users;
