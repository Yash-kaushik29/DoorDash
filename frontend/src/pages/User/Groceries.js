import React, { useState, useEffect, useContext } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import ProductCard from "../../components/ProductCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { UserContext } from "../../context/userContext";

const Groceries = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const {user, setUser} = useContext(UserContext);

  const fetchGroceries = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/common/groceries?page=${page}&limit=10`, {withCredentials: true}
      );
      if (data.products.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...data.products]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching groceries:", error);
      toast.error("Error fetching grocery products.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroceries();
  }, [page]);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />

      <section className="pb-6 container mx-auto px-4">
        {loading && <p className="text-center text-gray-500">Loading groceries...</p>}

        <InfiniteScroll
          dataLength={products.length}
          next={() => setPage((prev) => prev + 1)}
          hasMore={hasMore}
          loader={<p className="text-center text-gray-500">Loading more products...</p>}
          endMessage={<p className="text-center text-gray-400">No more products available.</p>}
        >
          <div className="mt-6 p-4 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-8 gap-6 mb-12 lg:mb-0">
            {products.map((product, index) => (
              <ProductCard key={index} product={product} bestSeller={false} user={user} setUser={setUser} />
            ))}
          </div>
        </InfiniteScroll>
      </section>
    </div>
  );
};

export default Groceries;
