import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { UserContext } from "../../context/userContext";
import Navbar from "../../components/Navbar";
import axios from "axios";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready } = useContext(UserContext);
  const { cartItems, totalPrice, sellers } = location.state || {
    cartItems: [],
    totalPrice: 0,
    sellers: 1,
  };
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [taxes, setTaxes] = useState((totalPrice * 5) / 100);

  const convenienceFees = (sellers.length - 1) * 15;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getDeliveryCharge = (distance) => {
    if (distance <= 2) return 20;
    if (distance <= 4) return 30;
    if (distance <= 8) return 45;
    if (distance <= 20) return 70;
    return distance * 10;
  };

  useEffect(() => {
    if (ready && !user) {
      navigate("/user/profile");
    }
    if (ready) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user-profile/getAddresses`,
        { params: { userId: user._id } }
      );
      if (res.data.success) {
        setUserAddresses(res.data.addresses);
      } else {
        toast.error("Failed to fetch addresses");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error fetching addresses");
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (isPlacingOrder) return; // prevent multiple clicks
    setIsPlacingOrder(true);

    const address = selectedAddress;

    try {
      if (paymentMethod === "COD") {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/order/create-order`,
          {
            userId: user._id,
            cartItems,
            taxes,
            convenienceFees,
            address: selectedAddress,
            paymentStatus: "Unpaid",
            deliveryCharge,
          },
          { withCredentials: true }
        );

        if (data.success) {
          toast.success("🎉 Order Placed Successfully!");
          setTimeout(() => navigate(`/order/${data.order._id}`), 2000);
        } else {
          toast.error(data.message);
        }
      } else {
        await handlePayment(address);
      }
    } catch (error) {
      setIsPlacingOrder(false);
      console.error("Error placing order:", error);
      toast.error("Something went wrong while placing the order.");
    }
  };

  const handlePayment = async (address) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/createOrder`,
        { orderId: 1, cart: cartItems, deliveryCharge },
        { withCredentials: true }
      );

      const razor = new window.Razorpay({
        key: "rzp_test_HVuV1GjtInzu0b",
        order_id: data.order.id,
        amount: data.order.amount,
        currency: "INR",
        description: "Payment for Order",
        handler: async function (response) {
          const verifyRes = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/payment/verify-payment`,
            {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
            { withCredentials: true }
          );

          if (verifyRes.data.success) {
            const res = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/order/create-order`,
              {
                userId: user._id,
                cartItems,
                taxes,
                convenienceFees,
                address,
                paymentStatus: "Paid",
                deliveryCharge,
              },
              { withCredentials: true }
            );
            if (res.data.success) {
              toast.success("🎉 Order Placed Successfully!");
              setTimeout(() => navigate(`/order/${res.data.order._id}`), 2000);
            } else {
              toast.error(res.data.message);
            }
          } else {
            toast.error("❌ Payment Verification Failed!");
          }
        },
      });

      razor.open();
    } catch (error) {
      toast.error("❌ Error initiating payment!");
    }
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    const distance = calculateDistance(
      28.83811395386716,
      78.24223013771964,
      addr.lat,
      addr.long
    );

    setDeliveryCharge(getDeliveryCharge(distance));
  };

  return (
    <div className="mx-2 pb-16">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="max-w-lg mx-auto mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Choose Delivery Address</h2>

        {userAddresses.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            <p>No saved addresses found.</p>
            <button
              onClick={() => navigate(`/user/addresses/${user._id}`)}
              className="mt-2 text-green-500 underline"
            >
              ➕ Add a new address
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {userAddresses.map((addr, index) => (
              <div
                key={index}
                onClick={() => handleSelectAddress(addr)}
                className={`border rounded-lg p-3 cursor-pointer transition-all duration-200
      ${
        selectedAddress?._id === addr._id
          ? "border-green-500 bg-green-100 dark:bg-green-900"
          : "border-gray-300 dark:border-gray-600 hover:border-green-400"
      }
    `}
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  {addr.fullName}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {addr.phone}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-400">
                  {addr.addressLine}, {addr.area}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="my-6 text-right">
          <p className="font-semibold">
            Cart Total:{" "}
            <span className="text-green-500 ml-2">₹{totalPrice}</span>
          </p>
          <p className="font-semibold">
            Delivery Fee:{" "}
            <span className="text-green-500 ml-2">₹{deliveryCharge}</span>
          </p>
          <p className="font-semibold">
            Tax:{" "}
            <span className="text-green-500 ml-2">
              ₹{(totalPrice * 5) / 100}
            </span>
          </p>
          {convenienceFees > 0 && (
            <p className="font-semibold">
              Multiple Store convenience Fee:{" "}
              <span className="text-green-500 ml-2">
                ₹{convenienceFees}
              </span>
            </p>
          )}
          <div className="h-[1px] bg-black dark:bg-white my-2"></div>
          <p className="font-semibold">
            Total:{" "}
            <span className="text-green-500 ml-2">
              ₹{totalPrice + taxes + convenienceFees + deliveryCharge}
            </span>
          </p>
        </div>

        <div className="space-y-3 mt-4">
          <label>Select Payment Method:</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`p-3 w-1/2 rounded-lg ${
                paymentMethod === "COD"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-500"
              }`}
            >
              Cash on Delivery
            </button>
            <button
              onClick={() => setPaymentMethod("Razorpay")}
              className={`p-3 w-1/2 rounded-lg ${
                paymentMethod === "Razorpay"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-500"
              }`}
            >
              Pay with Razorpay
            </button>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={!selectedAddress}
          className={`w-full py-2 mt-4 rounded-lg ${
            selectedAddress
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isPlacingOrder
            ? "Placing your order..."
            : paymentMethod === "Razorpay"
            ? "Proceed to Pay"
            : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
