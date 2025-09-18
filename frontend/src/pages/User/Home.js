import React, { useContext, useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import SearchBar from "../../components/SearchBar";
import { MdDinnerDining } from "react-icons/md";
import { GiMedicines, GiNoodles, GiFruitBowl } from "react-icons/gi";
import { UserContext } from "../../context/userContext";
import HomePageSkeleton from "../../skeletons/HomePageSkeleton";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import ShopCard from "../../components/ShopCard";
import ProductCard from "../../components/ProductCard";
import { Link } from "react-router-dom";
import InstallPrompt from "../../components/InstallPrompt";

const Home = () => {
  const { user, setUser, ready } = useContext(UserContext);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);

  console.log(user)

  const fetchPopularShops = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/home/get-popular-shops`,
        { withCredentials: true }
      );
      if (data.success) setShops(data.shops);
      else toast.error(data.message);
    } catch (error) {
      toast.error("Failed to fetch shops");
      console.error(error);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/home/get-popular-products`,
        { withCredentials: true }
      );
      if (data.success) setProducts(data.products);
      else toast.error(data.message);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPopularShops();
    fetchPopularProducts();
  }, [user]);

  // Memoized Shop Cards
  const memoizedShops = useMemo(() => {
    if (shops.length === 0) {
      return Array(5)
        .fill(0)
        .map((_, i) => <HomePageSkeleton key={i} />);
    }
    return shops.map((shop, i) => <ShopCard key={i} shop={shop} />);
  }, [shops]);

  // Memoized Product Cards
  const memoizedProducts = useMemo(() => {
    if (products.length === 0) {
      return Array(8)
        .fill(0)
        .map((_, i) => <HomePageSkeleton key={i} />);
    }
    return products.map((product, i) => (
      <ProductCard
        key={i}
        product={product}
        bestSeller={true}
        user={user}
        setUser={setUser}
      />
    ));
  }, [products, user, setUser]);

  if (!ready) return <HomePageSkeleton />;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <InstallPrompt />

      {/* Mobile App Name */}
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

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mt-4 px-4">
        <SearchBar />
      </div>

      {/* Categories Section */}
      <section className="py-8 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Browse Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { name: "Groceries", img: "/groceries.jpg", icon: <GiFruitBowl /> },
            { name: "Restaurants", img: "/food.jpg", icon: <MdDinnerDining /> },
            { name: "Medicines", img: "/medicines.jpg", icon: <GiMedicines /> },
          ].map((cat, i) => (
            <Link
              key={i}
              to={`/products/${cat.name.toLowerCase()}`}
              className="relative rounded-2xl overflow-hidden shadow-lg hover:scale-105 transform transition duration-300"
            >
              <img src={cat.img} alt={cat.name} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-white text-xl font-bold flex items-center gap-2">
                  {cat.icon} {cat.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Shops */}
      <section className="py-8 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Popular Shops</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">{memoizedShops}</div>
      </section>

      {/* Featured Products */}
      <section className="py-8 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
          {memoizedProducts}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto text-center space-y-2">
          <p>&copy; 2025 GullyFoods. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-green-500">
              Instagram
            </a>
            <a href="#" className="hover:text-green-500">
              Twitter
            </a>
            <a href="#" className="hover:text-green-500">
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
