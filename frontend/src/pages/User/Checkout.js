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
  const {
    cartItems,
    totalPrice: cartTotalPrice,
    sellers,
    cartKey,
  } = location.state || { cartItems: [], totalPrice: 0, sellers: 1, cartKey: "food" };

  const isFoodOrder = cartKey === "food";

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Food order fields
  const [taxes, setTaxes] = useState(isFoodOrder ? (cartTotalPrice * 5) / 100 : 0);
  const convenienceFees = isFoodOrder ? (sellers.length - 1) * 15 : 0;

  if (cartItems.length === 0) navigate("/cart");

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Food delivery charge
  const getFoodDeliveryCharge = (distance) => {
    if (distance <= 2) return 20;
    if (distance <= 4) return 25;
    if (distance <= 8) return 45;
    if (distance <= 20) return 70;
    return distance * 10;
  };

  // Grocery delivery charge (distance + num of items)
 const getGroceryDeliveryCharge = (distance, numItems) => {
  let base = 0;

  // Distance-based base charge
  if (distance <= 2) base = 20;
  else if (distance <= 4) base = 25;
  else if (distance <= 8) base = 45;
  else base = distance * 10;

  // Minimal per-item tiered pricing
  let extra = 0;
  if (numItems >= 5 && numItems <= 10) extra = 5;
  else if (numItems >= 11 && numItems <= 15) extra = 10;
  else if (numItems > 15) extra = 15;

  return base + extra;
};


  // Grocery service charge based on cartItemsPrice
  const getGroceryServiceCharge = (cartPrice) => {
    if (cartPrice < 300) return 20;
    if (cartPrice < 500) return 15;
    if (cartPrice < 700) return 10;
    return 0;
  };

  useEffect(() => {
    if (ready && !user) navigate("/user/profile");
    if (ready) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user-profile/getAddresses`,
        { params: { userId: user._id } }
      );
      if (res.data.success) setUserAddresses(res.data.addresses);
      else toast.error("Failed to fetch addresses");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching addresses");
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

    if (isFoodOrder) setDeliveryCharge(getFoodDeliveryCharge(distance));
    else setDeliveryCharge(getGroceryDeliveryCharge(distance, cartItems.length));
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    let serviceCharge = 0;
    if (!isFoodOrder) serviceCharge = getGroceryServiceCharge(cartTotalPrice);

    try {
      const orderPayload = {
        userId: user._id,
        cartItems,
        orderType: isFoodOrder ? "Food" : "Grocery",
        deliveryCharge,
        serviceCharge,
        taxes: isFoodOrder ? taxes : undefined,
        convenienceFees: isFoodOrder ? convenienceFees : undefined,
        address: selectedAddress,
        paymentMethod: paymentMethod === "Razorpay" ? "Online" : "COD",
        paymentStatus: paymentMethod === "Razorpay" ? "Paid" : "Unpaid",
        cartKey,
      };

      if (paymentMethod === "COD") {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/order/create-order`,
          orderPayload,
          { withCredentials: true }
        );
        if (data.success) {
          toast.success("🎉 Order Placed Successfully!");
          setTimeout(() => navigate(`/order/${data.order._id}`), 2000);
        } else toast.error(data.message);
      } else {
        await handlePayment(orderPayload);
      }
    } catch (error) {
      setIsPlacingOrder(false);
      console.error(error);
      toast.error("Something went wrong while placing the order.");
    }
  };

  const handlePayment = async (orderPayload) => {
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
              orderPayload,
              { withCredentials: true }
            );
            if (res.data.success) {
              toast.success("🎉 Order Placed Successfully!");
              setTimeout(() => navigate(`/order/${res.data.order._id}`), 2000);
            } else toast.error(res.data.message);
          } else toast.error("❌ Payment Verification Failed!");
        },
      });

      razor.open();
    } catch (error) {
      toast.error("❌ Error initiating payment!");
    }
  };

  // Total calculation dynamically
  const totalAmount =
    cartTotalPrice +
    (isFoodOrder ? taxes + convenienceFees + deliveryCharge : getGroceryServiceCharge(cartTotalPrice) + deliveryCharge);

  if (isPlacingOrder) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-100">
        <video
          src="/logoAnimation.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-64 h-64 object-contain"
        />
        <p className="mt-6 text-green-600 font-semibold text-lg">
          Placing your order...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-2 pb-20 bg-stone-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="max-w-lg mx-auto mt-8 p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Choose Delivery Address 🏠
        </h2>

        {userAddresses.length === 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>No saved addresses found.</p>
            <button
              onClick={() => navigate(`/user/addresses/${user._id}`)}
              className="mt-2 text-green-500 underline hover:text-green-600"
            >
              ➕ Add a new address
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {userAddresses.map((addr, index) => (
              <div
                key={index}
                onClick={() => handleSelectAddress(addr)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2
                  ${
                    selectedAddress?._id === addr._id
                      ? "border-green-500 bg-green-50 dark:bg-green-900"
                      : "border-gray-300 dark:border-gray-600 hover:border-green-400"
                  }`}
              >
                <p className="font-semibold text-gray-900 dark:text-white">{addr.fullName}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{addr.phone}</p>
                <p className="text-sm text-gray-800 dark:text-gray-400">{addr.addressLine}, {addr.area}</p>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-6 space-y-2">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Order Summary 🛒</h3>
          <div className="flex justify-between">
            <span>Cart Total:</span>
            <span className="text-green-500 font-semibold">₹{cartTotalPrice}</span>
          </div>

          {isFoodOrder && (
            <>
              <div className="flex justify-between">
                <span>Delivery Fee 🚚:</span>
                <span className="text-green-500 font-semibold">₹{deliveryCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%) 💰:</span>
                <span className="text-green-500 font-semibold">₹{taxes}</span>
              </div>
              {convenienceFees > 0 && (
                <div className="flex justify-between">
                  <span>Multi-store Fee ⚡:</span>
                  <span className="text-green-500 font-semibold">₹{convenienceFees}</span>
                </div>
              )}
            </>
          )}

          {!isFoodOrder && (
            <>
              <div className="flex justify-between">
                <span>Service Charge 📝:</span>
                <span className="text-green-500 font-semibold">₹{getGroceryServiceCharge(cartTotalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee 🚚:</span>
                <span className="text-green-500 font-semibold">₹{deliveryCharge}</span>
              </div>
            </>
          )}

          <div className="h-[1px] bg-gray-300 dark:bg-gray-600 my-2"></div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-green-600">₹{totalAmount}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3 mb-6">
          <label className="font-semibold text-gray-800 dark:text-gray-100">Select Payment Method 💳:</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`p-3 w-1/2 rounded-xl font-semibold transition transform hover:scale-105
                ${paymentMethod === "COD" ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-500"}
              `}
            >
              Cash on Delivery
            </button>
            <button
              onClick={() => setPaymentMethod("Razorpay")}
              className={`p-3 w-1/2 rounded-xl font-semibold transition transform hover:scale-105
                ${paymentMethod === "Razorpay" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-500"}
              `}
            >
              Pay with Razorpay
            </button>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!selectedAddress}
          className={`w-full py-3 mt-2 rounded-xl font-bold text-lg transition 
            ${selectedAddress ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 cursor-not-allowed text-gray-600"}
          `}
        >
          {paymentMethod === "Razorpay" ? "Proceed to Pay 💳" : "Place Order 🎉"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
