import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SearchBar from "../../components/SearchBar";
import { MdDeliveryDining, MdDinnerDining } from "react-icons/md";
import { GiMedicines, GiNoodles, GiFruitBowl } from "react-icons/gi";
import { UserContext } from "../../context/userContext";
import HomePageSkeleton from "../../skeletons/HomePageSkeleton";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import ShopCard from "../../components/ShopCard";
import ProductCard from "../../components/ProductCard";
import { Link } from "react-router-dom";
import InstallPrompt from "../../components/InstallPrompt";

const Home = () => {
  const { user, setUser, ready } = useContext(UserContext);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchPopularShops = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/home/get-popular-shops`,
        { withCredentials: true }
      );

      if (data.success) {
        setShops(data.shops);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/home/get-popular-products`,
        { withCredentials: true }
      );

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    fetchPopularShops();
    fetchPopularProducts();
  }, [user]);

  if (!ready) return <HomePageSkeleton />;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      <InstallPrompt />

      {/* Mobile Title */}
      <div className="flex flex-col items-center pt-4 lg:hidden">
        <div className="flex items-center gap-2 text-3xl">
          <span className="font-bold text-black dark:text-white">
            Gully<span className="text-green-500">Foods</span>
          </span>

          <GiNoodles className="font-bold text-green-500 -mt-1" />
        </div>
        <span className="italic text-gray-600 font-semibold dark:text-white text-lg text-center">
          Your lane, your taste, your GullyFoods ✨
        </span>
      </div>

      <SearchBar />

      {/* Hero Section */}
      <section className="text-center py-10">
        <h1 className="text-3xl md:text-5xl font-bold">
          Fast & Reliable Delivery
        </h1>
        <p className="text-lg mt-2">
          Get groceries, food, and medicines delivered at your doorstep
        </p>
      </section>

      {/* Categories Section */}
      <section className="py-6 container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
        {[
          {
            name: "Groceries",
            img: "/groceries.jpg",
            icon: <GiFruitBowl />,
          },
          { name: "Restaurants", img: "/food.jpg", icon: <MdDinnerDining /> },
          { name: "Medicines", img: "/medicines.jpg", icon: <GiMedicines /> },
        ].map((category, index) => (
          <Link
            to={`/products/${category.name.toLocaleLowerCase()}`}
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center transform transition duration-300 hover:scale-105"
          >
            <img
              src={category.img}
              alt={category.name}
              className="w-full h-40 object-cover rounded-lg"
            />
            <div className="text-xl font-semibold mt-2 flex gap-2 items-center justify-center text-green-500">
              {category.name} {category.icon}
            </div>
          </Link>
        ))}
      </section>

      {/* Popular Shops */}
      <section className="py-6 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Popular Shops</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {shops &&
            shops.map((shop, index) => <ShopCard key={index} shop={shop} />)}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-6 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-8 gap-6">
          {products &&
            products.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                bestSeller={true}
                user={user}
                setUser={setUser}
              />
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 text-center mt-10">
        <p>&copy; 2025 GullyFoods. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
