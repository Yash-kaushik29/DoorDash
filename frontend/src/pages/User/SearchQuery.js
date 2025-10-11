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

const SearchQuery = () => {
  const { query } = useParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    // Reset products and pagination when query changes
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [query]);

  useEffect(() => {
    const fetchQueryProducts = async () => {
      if (!query) return;

      setLoading(true);
      try {
        const { data } = await api.get(
          `/api/common/search/${encodeURIComponent(query)}?page=${page}`
        );

        setProducts((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length > 0);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    fetchQueryProducts();
  }, [page, query]);

  if (loading && page === 1) return <SearchPageSkeleton />;

  return (
    <div className="pb-16">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      {products.length === 0 && !loading ? (
        <p className="text-center mt-12 text-gray-500">
          No products found for "<span className="font-semibold">{query}</span>"
        </p>
      ) : (
        <InfiniteScroll
          dataLength={products.length} // Current product count
          next={() => setPage((prev) => prev + 1)} // Load next page
          hasMore={hasMore} // Keep fetching until no more data
          loader={
            <p className="text-center text-gray-500">
              Loading more products...
            </p>
          }
          endMessage={
            <p className="text-center text-gray-400">
              No more products to show.
            </p>
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
