import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

import Navbar from "../../components/Navbar";
import { UserContext } from "../../context/userContext";
import CheckoutPayment from "../../components/CheckoutPayment"; // Payment & Place Order button
import CheckoutCoupons from "../../components/CheckoutCoupons"; // Coupons UI
import CheckoutSummary from "../../components/CheckoutSummary"; // Order summary & total
import CheckoutAddress from "../../components/CheckoutAddress ";
import api from "../../utils/axiosInstance";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready } = useContext(UserContext);

  const {
    cartItems,
    totalPrice: cartTotalPrice,
    sellers,
    cartKey,
  } = location.state || {
    cartItems: [],
    totalPrice: 0,
    sellers: 1,
    cartKey: "foodCart",
  };

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const isFoodOrder = cartKey === "foodCart";

  const taxes = isFoodOrder ? (cartTotalPrice * 5) / 100 : 0;
  const [convenienceFees, setConvenienceFees] = useState(
    isFoodOrder ? (sellers.length - 1) * 15 : 0
  );

  if (cartItems.length === 0) navigate("/cart");

  // Fetch active coupons
  useEffect(() => {
    const fetchActiveCoupons = async () => {
      if (ready && !user) return;
      try {
        const { data } = await api.get(
          `/api/user-profile/active-coupons`,
          { withCredentials: true }
        );

        if (data.success) setActiveCoupons(data.activeCoupons);
        else toast.error(data.message);
      } catch (error) {
        console.error("Error fetching active coupons:", error);
        toast.error("Failed to load coupons");
      }
    };

    fetchActiveCoupons();
  }, [user]);

  // Fetch addresses
  useEffect(() => {
    if (ready && !user) navigate("/user/profile");
    if (ready) fetchAddresses();
  }, [user, ready]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get(
        `/api/user-profile/getAddresses`,
        { params: { userId: user._id } }
      );
      if (res.data.success) setUserAddresses(res.data.addresses);
      else toast.error("Failed to fetch addresses");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching addresses");
    }
  };

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

  const getFoodDeliveryCharge = (distance) => {
    if (distance <= 3) return 25;
    if (distance <= 4) return 30;
    if (distance <= 5) return 40;
    if (distance <= 6) return 45;
    if (distance <= 8) return 60;
    if (distance <= 10) return 70;
    if (distance <= 12) return 80;
    return distance * 10;
  };

  const getGroceryServiceCharge = (cartPrice) => {
    if (cartPrice < 300) return 20;
    if (cartPrice < 500) return 15;
    if (cartPrice < 700) return 10;
    return 0;
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);

    const distance = calculateDistance(
      28.83811395386716,
      78.24223013771964,
      addr.lat,
      addr.long
    );

    const delivery = getFoodDeliveryCharge(distance);
    setDeliveryCharge(delivery);

    if (isFoodOrder && sellers.length > 1) {
      const perShopFee = Math.max(15, delivery * 0.3);
      const totalConvenienceFees = perShopFee * (sellers.length - 1);
      setConvenienceFees(Math.round(totalConvenienceFees));
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress)
      return toast.error("Please select a delivery address.");
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    const serviceCharge = !isFoodOrder
      ? getGroceryServiceCharge(cartTotalPrice)
      : 0;

    const orderPayload = {
      userId: user._id,
      cartItems,
      orderType: isFoodOrder ? "Food" : "Grocery",
      deliveryCharge,
      serviceCharge,
      taxes: isFoodOrder ? taxes : undefined,
      convenienceFees: isFoodOrder ? convenienceFees : undefined,
      discount,
      coupon: selectedCoupon ? selectedCoupon._id : null,
      address: selectedAddress,
      paymentMethod: paymentMethod === "Razorpay" ? "Online" : "COD",
      paymentStatus: paymentMethod === "Razorpay" ? "Paid" : "Unpaid",
      cartKey,
    };

    try {
      if (paymentMethod === "COD") {
        const { data } = await api.post(
          `/api/order/create-order`,
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
      const { data } = await api.post(
        `/api/payment/createOrder`,
        { orderId: 1, cart: cartItems, deliveryCharge },
        { withCredentials: true }
      );

      const razor = new window.Razorpay({
        key: "rzp_test_HVuV1GjtInzu0b",
        order_id: data.order.id,
        amount: data.order.amount,
        currency: "INR",
        description: "Payment for Order",
        handler: async (response) => {
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
            const { data } = await api.post(
              `/api/order/create-order`,
              orderPayload,
              { withCredentials: true }
            );
            if (data.success) {
              toast.success("🎉 Order Placed Successfully!");
              setTimeout(() => navigate(`/order/${data.order._id}`), 2000);
            } else toast.error(data.message);
          } else toast.error("❌ Payment Verification Failed!");
        },
      });

      razor.open();
    } catch (error) {
      toast.error("❌ Error initiating payment!");
    }
  };

  const totalAmount =
    cartTotalPrice +
    (isFoodOrder
      ? taxes + convenienceFees + deliveryCharge
      : getGroceryServiceCharge(cartTotalPrice) + deliveryCharge);

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
    <div className="mx-2 pb-20 pt-6 bg-stone-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      <div className="max-w-lg mx-auto p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Checkout 🛒
        </h2>

        {/* Address Selection */}
        {user && (
          <CheckoutAddress
            userAddresses={userAddresses}
            selectedAddress={selectedAddress}
            handleSelectAddress={handleSelectAddress}
            navigate={navigate}
            user={user}
          />
        )}

        {/* Order Summary */}
        <CheckoutSummary
          cartTotalPrice={cartTotalPrice}
          selectedCoupon={selectedCoupon}
          totalAmount={totalAmount}
          isFoodOrder={isFoodOrder}
          taxes={taxes}
          deliveryCharge={deliveryCharge}
          convenienceFees={convenienceFees}
          discount={discount}
          getGroceryServiceCharge={getGroceryServiceCharge}
        />

        {/* Payment Method & Place Order */}
        <CheckoutPayment
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleCheckout={handleCheckout}
          selectedAddress={selectedAddress}
        />

        {/* Coupon Selection */}
        <CheckoutCoupons
          cartTotalPrice={cartTotalPrice}
          setDiscount={setDiscount}
          activeCoupons={activeCoupons}
          selectedCoupon={selectedCoupon}
          setSelectedCoupon={setSelectedCoupon}
        />
      </div>
    </div>
  );
};

export default Checkout;
