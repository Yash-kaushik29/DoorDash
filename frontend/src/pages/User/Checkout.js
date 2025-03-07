import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { UserContext } from "../../context/userContext";
import { getDistance } from "geolib";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { IoIosArrowDropdown } from "react-icons/io";

const areas = [
  {
    name: "Jubilant",
    charge: 25,
    lat: 28.82122082353085,
    long: 78.23420637938032,
  },
  {
    name: "Atal ji Nagar",
    charge: 25,
    lat: 28.816257808930494,
    long: 78.23136527235235,
  },
  {
    name: "Choupla, Gajraula",
    charge: 20,
    lat: 28.828252405295537,
    long: 78.2470399773071,
  },
  {
    name: "Sultan Nagar",
    charge: 25,
    lat: 28.828065172243164,
    long: 78.25268624693784,
  },
  {
    name: "MDA Colony",
    charge: 20,
    lat: 28.830922122809074,
    long: 78.25078543617947,
  },
  {
    name: "Bhanpur",
    charge: 25,
    lat: 28.8344529674564,
    long: 78.26054360762019,
  },
  {
    name: "Railway Station",
    charge: 20,
    lat: 28.835918508048398,
    long: 78.24652026295455,
  },
  {
    name: "Mansarovar Colony",
    charge: 20,
    lat: 28.84131852493621,
    long: 78.24404879843388,
  },
  {
    name: "Basti",
    charge: 20,
    lat: 28.843886869227386,
    long: 78.23991163560208,
  },
  {
    name: "Atarpura",
    charge: 20,
    lat: 28.835079868515155,
    long: 78.24020452650875,
  },
  {
    name: "TEVA Ltd.",
    charge: 25,
    lat: 28.83610396509657,
    long: 78.23003078547463,
  },
  {
    name: "KhadGujjar Road",
    charge: 20,
    lat: 28.840300485598288,
    long: 78.25105503888373,
  },
  {
    name: "Saraswati Vihar",
    charge: 20,
    lat: 28.838375887879753,
    long: 78.25170565516713,
  },
  { name: "Salempur Road", charge: 30, lat: 28.68, long: 77.285 },
  {
    name: "Venkateshwara Institute",
    charge: 60,
    lat: 28.839593558282083,
    long: 78.34688791487751,
  },
];

const Checkout = () => {
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    area: "",
    latitude: null,
    longitude: null,
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const location = useLocation();
  const { cartItems, totalPrice } = location.state || {
    cartItems: [],
    totalPrice: 0,
  };
  const { user } = useContext(UserContext);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();
  const [showAreas, setShowAreas] = useState(false);

  console.log(cartItems)

  const handleUseMyLocation = () => {
    setFetching(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAddress((prev) => ({ ...prev, latitude, longitude }));
          toast.success("Location fetched successfully!");
          assignNearestArea(latitude, longitude);
          setFetching(false);
        },
        (error) => {
          toast.error("Error fetching location: " + error.message);
          setFetching(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation not supported by this browser.");
      setFetching(false);
    }
  };

  const assignNearestArea = (latitude, longitude) => {
    let nearestArea = areas[0];
    let minDistance = getDistance(
      { latitude, longitude },
      { latitude: areas[0].lat, longitude: areas[0].long }
    );

    areas.forEach((area) => {
      const dist = getDistance(
        { latitude, longitude },
        { latitude: area.lat, longitude: area.long }
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearestArea = area;
      }
    });

    setAddress((prev) => ({ ...prev, area: nearestArea.name }));
    setDeliveryCharge(nearestArea.charge);
  };

  const handleCheckout = async () => {
    if (
      !address.fullName ||
      !address.phone ||
      !address.addressLine ||
      !address.area
    ) {
      console.log(address)
      toast.error("Please fill in all address details!");
      return;
    }
    if (paymentMethod === "COD") {
      const { data } = await axios.post(
        "http://localhost:5000/api/order/create-order",
        {
          userId: user._id,
          cartItems,
          address,
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
      handlePayment();
    }
  };

  const handlePayment = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/createOrder",
        {
          orderId: 1,
          cart: cartItems,
          deliveryCharge,
        },
        { withCredentials: true }
      );

      const paymentObject = new window.Razorpay({
        key: "rzp_test_HVuV1GjtInzu0b",
        order_id: data.order.id,
        amount: data.order.amount,
        currency: "INR",
        description: "Payment for Order",
        handler: async function (response) {
          const verifyRes = await axios.post(
            "http://localhost:5000/api/payment/verify-payment",
            {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
            { withCredentials: true }
          );

          if (verifyRes.data.success) {
            toast.success("🎉 Payment Verified!");
            const { data } = await axios.post(
              "http://localhost:5000/api/order/create-order",
              {
                userId: user._id,
                cartItems,
                address,
                paymentStatus: "Paid",
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
            toast.error("❌ Payment Verification Failed!");
          }
        },
      });

      paymentObject.open();
    } catch (error) {
      toast.error("❌ Error initiating payment!");
    }
  };

  const getDefaultAddress = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/user-profile/getDefaultAddress/${user._id}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Default address fetched!");
        setAddress(data?.defaultAddress[0]);
        const selectedArea = data?.defaultAddress[0].area;
        const areaData = areas.find((area) => area.name === selectedArea);

        if (areaData) {
          setDeliveryCharge(areaData.charge);
        } else {
          setDeliveryCharge(0);
        }
      } else {
        toast.error(data.message || "Error in finding default address");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in finding default address");
    }
  };

  return (
    <div className="mx-2 pb-16">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <div className="max-w-lg mx-auto mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-all">
        <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg dark:bg-gray-900"
            value={address.fullName}
            onChange={(e) => setAddress({ ...address, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-3 border rounded-lg dark:bg-gray-900"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address Line"
            className="w-full p-3 border rounded-lg dark:bg-gray-900"
            value={address.addressLine}
            onChange={(e) =>
              setAddress({ ...address, addressLine: e.target.value })
            }
          />
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setShowAreas(!showAreas)}
              className="w-full p-3 border rounded-lg dark:bg-gray-900 text-left flex items-center justify-between"
            >
              {address.area || "Select Area"}
              <IoIosArrowDropdown className="text-gray-800 dark:text-white text-xl" />
            </button>

            {showAreas && (
              <div className="absolute w-full bg-white dark:bg-gray-700 border rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                {areas.map((area) => (
                  <p
                    key={area.name}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() => {
                      setAddress({ ...address, area: area.name });
                      setDeliveryCharge(area.charge);
                      setShowAreas(false);
                    }}
                  >
                    {area.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </form>
        <button
          onClick={handleUseMyLocation}
          className={`${
            fetching ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600"
          } w-full mt-3 p-3 text-white rounded-lg`}
          disabled={fetching}
        >
          {fetching ? "Spotting you..." : "Find my area"}
        </button>

        <button
          onClick={getDefaultAddress}
          className="bg-green-500 hover:bg-green-600 w-full mt-3 p-3 text-white rounded-lg"
        >
          Fill default address
        </button>

        <div className="my-6 text-right">
          <p className="font-semibold">
            Cart Total:{" "}
            <span className="text-green-500 ml-2">₹{totalPrice}</span>
          </p>
          <p className="font-semibold">
            Delivery Fee:{" "}
            <span className="text-green-500 ml-2">
              ₹{deliveryCharge > 0 ? deliveryCharge : "--"}
            </span>
          </p>
          <div className="h-[1px] bg-black dark:bg-white my-2"></div>
          <p className="font-semibold">
            Total:{" "}
            <span className="text-green-500 ml-2">
              ₹{totalPrice + deliveryCharge}
            </span>
          </p>
          <div className="h-[1px] bg-black dark:bg-white my-2"></div>
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
          className="w-full bg-green-600 text-white py-2 mt-4 rounded-lg"
        >
          {paymentMethod === "Razorpay" ? "Proceed to Pay" : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
