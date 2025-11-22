import React, { useState, useEffect } from "react";
import AdminHeader from "../../components/AdminHeader";
import { Link, useParams } from "react-router-dom";
import api from "../../utils/axiosInstance";

const UserDetails = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTab, setCurrentTab] = useState("food");

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/user/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("User not found or an error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminHeader />

      <div className="p-4 bg-gray-900 min-h-screen text-gray-200">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-4xl font-extrabold mb-6">User Details</h2>

          {loading && <p className="text-blue-400">Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {user && (
            <div className="space-y-10">

              {/* ---------------------- BASIC INFO ---------------------- */}
              <section>
                <h3 className="text-2xl font-semibold mb-4">Basic Information</h3>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Name:</strong> {user.username}</p>
                  <p><strong>Phone:</strong> {user.phone}</p>
                  <p><strong>Email:</strong> {user.email || "N/A"}</p>
                  <p>
                    <strong>Joined:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </section>

              {/* ---------------------- ADDRESSES ---------------------- */}
              <section>
                <h3 className="text-2xl font-semibold mb-4">Addresses</h3>

                {user.addresses.length === 0 && (
                  <p className="text-gray-400">No addresses added.</p>
                )}

                <div className="space-y-4">
                  {user.addresses.map((addr, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <p><strong>Name:</strong> {addr.fullName}</p>
                      <p><strong>Phone:</strong> {addr.phone}</p>
                      <p><strong>Address:</strong> {addr.addressLine}</p>
                      <p><strong>Area:</strong> {addr.area}</p>
                      <p><strong>Landmark:</strong> {addr.landMark || "N/A"}</p>

                      <a
                        href={`https://www.google.com/maps?q=${addr.lat},${addr.long}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline mt-2 inline-block"
                      >
                        Open in Maps
                      </a>
                    </div>
                  ))}
                </div>
              </section>

              {/* ---------------------- CART TABS ---------------------- */}
              <section>
                <h3 className="text-2xl font-semibold mb-4">User Cart</h3>

                {/* Tabs */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setCurrentTab("food")}
                    className={`px-4 py-2 rounded-lg ${
                      currentTab === "food"
                        ? "bg-blue-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    Food Cart ({user.foodCart?.length})
                  </button>

                  <button
                    onClick={() => setCurrentTab("grocery")}
                    className={`px-4 py-2 rounded-lg ${
                      currentTab === "grocery"
                        ? "bg-green-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    Grocery Cart ({user.groceryCart?.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  {currentTab === "food" &&
                    (user.foodCart.length === 0 ? (
                      <p>No food items.</p>
                    ) : (
                      user.foodCart.map((item, i) => (
                        <p key={i} className="border-b border-gray-600 py-2">
                          {item.productId?.name} × {item.quantity}
                        </p>
                      ))
                    ))}

                  {currentTab === "grocery" &&
                    (user.groceryCart.length === 0 ? (
                      <p>No grocery items.</p>
                    ) : (
                      user.groceryCart.map((item, i) => (
                        <p key={i} className="border-b border-gray-600 py-2">
                          {item.productId?.name} × {item.quantity}
                        </p>
                      ))
                    ))}
                </div>
              </section>

              {/* ---------------------- RECENT ORDERS ---------------------- */}
              <section>
                <h3 className="text-2xl font-semibold mb-4">Recent Orders</h3>

                {user.orders.length === 0 && <p>No orders found.</p>}

                <div className="space-y-3">
                  {user.orders.slice(0, 10).map((order) => (
                    <Link
                      to={`/viewOrder/${order._id}`}
                      key={order._id}
                      className="block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition"
                    >
                      <p>
                        <strong>Order ID:</strong> #{order._id}
                      </p>
                      <p>
                        <strong>Total:</strong> ₹{order.amount}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
