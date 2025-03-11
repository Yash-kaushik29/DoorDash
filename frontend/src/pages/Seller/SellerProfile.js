import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerHeader from "../../components/SellerHeader";
import { Link, useNavigate } from "react-router-dom";

const SellerProfile = () => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/shop/seller-profile`,
          { withCredentials: true }
        );

        if (data.success) {
          console.log(data.seller)
          setSeller(data.seller);
        } else {
          setError(data.message || "Failed to load seller profile");
          setTimeout(() => navigate("/seller"), 2000);
        }
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        setError("Failed to load profile. Please try again later.");
        setError("Failed to load seller profile");
          setTimeout(() => navigate("/seller"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, [navigate]);

  const handleToggleShopStatus = async () => {
    try {
      const updatedStatus = !seller?.shop?.isOpen;
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/shop/update-status`,
        { isOpen: updatedStatus },
        { withCredentials: true }
      );

      setSeller((prev) => ({
        ...prev,
        shop: { ...prev.shop, isOpen: updatedStatus },
      }));

      toast.success(`Shop is now ${updatedStatus ? "Open" : "Closed"}!`);
    } catch (error) {
      console.error("Error updating shop status:", error);
      toast.error("Failed to update shop status.");
    }
  };

  const calculateSales = () => {
    return seller.salesHistory.reduce((sum, sale) => sum + sale.amount, 0);
  }

  if (loading) return <div className="text-center text-lg">Loading...</div>;

  if (error)
    return (
      <div className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-lg">
        {error}
      </div>
    );

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <SellerHeader />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-6">
          Seller Profile
        </h1>

        {/* Seller Details */}
        <div className="bg-purple-600 text-white rounded-xl p-6 mb-6">
          <h2 className="text-3xl font-bold mb-4">Seller Details</h2>
          <p>
            <strong>Username:</strong> {seller?.username || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {seller?.email || "N/A"}
          </p>
          <p>
            <strong>Sales:</strong> ₹{calculateSales()}
          </p>

          <Link
            to="/seller/edit-profile"
            className="mt-4 inline-block bg-yellow-500 px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Edit Profile
          </Link>
        </div>

        {/* Shop Details */}
        {seller?.shop ? (
          <div className="bg-gray-800 text-white p-6 rounded-lg">
            <h2 className="text-3xl mb-4">Shop Details</h2>
            <p>
              <strong>Name:</strong> {seller.shop.name || "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {seller.shop.category || "N/A"}
            </p>
            <p>
              <strong>Product Categories:</strong>{" "}
              {seller.shop.productCategories?.join(", ") || "N/A"}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {seller.shop.address?.addressLine || "N/A"}, {seller.shop.address?.city || "N/A"}
            </p>

            <div className="mt-4">
              <strong>Status:</strong>{" "}
              <span
                className={`ml-2 px-3 py-1 rounded-full ${
                  seller.shop.isOpen ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {seller.shop.isOpen ? "Open" : "Closed"}
              </span>
            </div>

            <button
              onClick={handleToggleShopStatus}
              className={`mt-6 px-6 py-2 rounded-lg ${
                seller.shop.isOpen ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              } transition`}
            >
              {seller.shop.isOpen ? "Close Shop" : "Open Shop"}
            </button>

            {/* Shop Images */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Shop Images</h3>
              {seller.shop.images?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {seller.shop.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Shop Image ${index + 1}`}
                      className="w-full h-40 rounded-lg shadow-md object-cover transition-transform hover:scale-105"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No Images Available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            No shop details found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
