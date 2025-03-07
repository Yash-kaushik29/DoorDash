import InfiniteScroll from 'react-infinite-scroll-component';
import ProductCard from './ProductCard';

const ProductList = ({ products, fetchMoreProducts, hasMore }) => {
  return (
    <InfiniteScroll
      dataLength={products.length}
      next={fetchMoreProducts}
      hasMore={hasMore}
      loader={<h4 className='text-center mt-4' >Loading...</h4>}
      endMessage={<p>No more products</p>}
    >
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-8 gap-6 px-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} bestSeller={false} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default ProductList;
