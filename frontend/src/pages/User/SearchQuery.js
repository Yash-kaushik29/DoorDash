import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import ProductCard from "../../components/ProductCard";
import Navbar from "../../components/Navbar";
import SearchPageSkeleton from "../../skeletons/SearchPageSkeleton";
import { UserContext } from "../../context/userContext";
import { ToastContainer } from "react-toastify";
import api from "../../utils/axiosInstance";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const SearchQuery = () => {
  const { query } = useParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [query]);

  // Fetch products
  useEffect(() => {
    const fetchQueryProducts = async () => {
      if (!query) return;

      setLoading(true);
      try {
        const { data } = await api.get(
          `/api/common/search/${encodeURIComponent(query)}?page=${page}`
        );

        setProducts((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length === 12);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    fetchQueryProducts();
  }, [page, query]);

  useEffect(() => {
    const checkScrollable = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      return scrollHeight > clientHeight + 50;
    };

    if (!loading && hasMore && !checkScrollable()) {
      setPage((prev) => prev + 1);
    }
  }, [products, loading, hasMore]);

  // Show skeleton on first load
  if (loading && page === 1) return <SearchPageSkeleton />;

  return (
    <div className="pb-16">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      {/* Empty State */}
      {products.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <DotLottieReact
            src="/lottie/nothing.lottie"
            loop
            autoplay
            className="w-64 h-64"
          />
          <p className="text-center mt-6 text-gray-500 dark:text-white text-lg">
            No products found for "
            <span className="font-semibold">{query}</span>"
          </p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={products.length}
          next={() => setPage((prev) => prev + 1)}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
          endMessage={
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <DotLottieReact
                src="/lottie/emptyList.lottie"
                loop
                autoplay
                className="w-64 h-64"
              />
              <p className="text-center mt-6 text-gray-500 dark:text-white text-lg">
                No more products to show.
              </p>
            </div>
          }
        >
          <div className="mt-6 p-4 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-8 gap-6 mb-12 lg:mb-0">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                bestSeller={false}
                user={user}
                setUser={setUser}
                variant={product.shopType === "Grocery" ? "grocery" : "food"}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default SearchQuery;
