import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/User/Home";
import Login from "./pages/User/Login";
import Signup from "./pages/User/Signup";
import { UserContextProvider } from "./context/userContext";
import SellerDashboard from "./pages/Seller/SellerDashBoard";
import AddProductForm from "./pages/Seller/AddProductForm";
import AddShop from "./pages/Seller/AddShop";
import ProductsList from "./pages/Seller/ProductsList";
import EditProductForm from "./pages/Seller/EditProductForm";
import EditShop from "./pages/Seller/EditShop";
import UserProfile from "./pages/User/UserProfile";
import Groceries from "./pages/User/Groceries";
import Medicines from "./pages/User/Medicines";
import SearchQuery from "./pages/User/SearchQuery";
import ShopPage from "./pages/User/ShopPage";
import CartPage from "./pages/User/CartPage";
import Checkout from "./pages/User/Checkout";
import OrderDetails from "./pages/User/OrderDetails";
import Notifications from "./pages/User/Notifications";
import OrderNotifications from "./pages/Seller/OrderNotifications";
import SellerOrder from "./pages/Seller/SellerOrder";
import Orders from "./pages/Seller/Orders";
import RecentOrders from "./pages/User/RecentOrders";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminSignup from "./pages/Admin/AdminSignup";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOrders from "./pages/Admin/AdminOrders";
import SingleOrder from "./pages/Admin/SingleOrder";
import SellerDetails from "./pages/Admin/SellerDetails";
import SellerList from "./pages/Admin/SellerList";
import AdminProducts from "./pages/Admin/AdminProducts";
import UserDetails from "./pages/Admin/UserDetails";
import DeliveryBoySignup from "./pages/DeliveryBoy/DeliveryBoySignup";
import DeliveryBoyLogin from "./pages/DeliveryBoy/DeliveryBoyLogin";
import DeliveryBoyHome from "./pages/DeliveryBoy/DeliveryBoyHome";
import DeliveryBoyOrders from "./pages/DeliveryBoy/DeliveryBoyOrders";
import DeliveryBoyOrder from "./pages/DeliveryBoy/DeliveryBoyOrder";
import Addresses from "./pages/User/Addresses";
import AccountSettings from "./pages/User/AccountSettings";
import HelpSupport from "./pages/User/HelpSupport ";
import Restaurants from "./pages/User/Restaurants";
import SellerSignup from "./pages/Seller/SellerSignup";
import SellerLogin from "./pages/Seller/SellerLogin";
import SellerProfile from "./pages/Seller/SellerProfile";
import EditProfile from "./pages/Seller/EditProfile";
import AvailableOrders from "./pages/DeliveryBoy/AvailableOrders";
import CommissionHistory from "./pages/DeliveryBoy/CommissionHistory";
import OutstandingAmountDetails from "./pages/DeliveryBoy/OutstandingAmountDetails";
import OutstandingAmountList from "./pages/Admin/OutstandingAmountList";
import DeliveryBoyDetails from "./pages/Admin/DeliveryBoyDetails";

const App = () => {
  return (
    <>
      <UserContextProvider>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/products/groceries" element={<Groceries />} />
          <Route path="/products/restaurants" element={<Restaurants />} />
          <Route path="/products/medicines" element={<Medicines />} />
          <Route path="/search/:query" element={<SearchQuery />} />
          <Route path="/shop/:shopId" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderDetails />} />
          <Route path="/recentOrders" element={<RecentOrders />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/user/addresses/:userId" element={<Addresses />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/help-support" element={<HelpSupport />} />
        </Routes>
      </UserContextProvider>

      <Routes>
        <Route path="/seller" exact element={<SellerDashboard />} />
        <Route path="/seller-signup" element={<SellerSignup />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/seller/add-shop" element={<AddShop />} />
        <Route path="/seller/edit-shop/:shopId" element={<EditShop />} />
        <Route path="/seller/add-product" element={<AddProductForm />} />
        <Route
          path="/seller/edit-product/:productId"
          element={<EditProductForm />}
        />
        <Route path="/seller/my-products" element={<ProductsList />} />
        <Route path="/seller/notifications" element={<OrderNotifications />} />
        <Route path="/getOrderDetails/:orderId" element={<SellerOrder />} />
        <Route path="/seller/my-orders" element={<Orders />} />
        <Route path="/seller/profile" element={<SellerProfile />} />
        <Route path="/seller/edit-profile" element={<EditProfile />} />
      </Routes>

      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/all-orders" element={<AdminOrders />} />
        <Route path="/viewOrder/:orderId" element={<SingleOrder />} />
        <Route path="/admin/seller/:sellerId" element={<SellerDetails />} />
        <Route path="/admin/getSellers" element={<SellerList />} />
        <Route path="/admin/adminProducts" element={<AdminProducts />} />
        <Route path="/admin/userDetails" element={<UserDetails />} />
        <Route path="/admin/outstandingAmounts" element={<OutstandingAmountList />} />
        <Route path="/admin/deliveryBoyDetails/:deliveryBoyId" element={<DeliveryBoyDetails />} />
      </Routes>

      <Routes>
        <Route path="/delivery/signup" element={<DeliveryBoySignup />} />
        <Route path="/delivery/login" element={<DeliveryBoyLogin />} />
        <Route path="/delivery" element={<DeliveryBoyHome />} />
        <Route path='/delivery/orders' element={<AvailableOrders />} />
        <Route
          path="/delivery/orders/:status"
          element={<DeliveryBoyOrders />}
        />
        <Route path="/delivery/order/:orderId" element={<DeliveryBoyOrder />} />
        <Route path="/delivery/commissionHistory" element={<CommissionHistory />} />
        <Route path="/delivery/outstandingAmountDetails" element={<OutstandingAmountDetails />} />
      </Routes>
    </>
  );
};

export default App;
