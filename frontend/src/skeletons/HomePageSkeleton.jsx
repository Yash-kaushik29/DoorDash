import React from 'react'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HomePageSkeleton = () => {
    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
          
          <section className="text-center py-10">
            <h1 className="text-3xl md:text-5xl font-bold">
              <Skeleton width={300} />
            </h1>
            <p className="text-lg mt-2">
              <Skeleton width={250} />
            </p>
          </section>
    
          {/* Categories Section */}
          <section className="py-6 container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
            {Array(3)
                  .fill()
                  .map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
                      <Skeleton height={160} />
                      <div className="text-xl font-semibold mt-2">
                        <Skeleton width={100} />
                      </div>
                    </div>
                  ))
              }
          </section>
    
          {/* Popular Shops */}
          <section className="py-6 container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">
              <Skeleton width={200} />
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4)
                    .fill()
                    .map((_, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                        <Skeleton height={50} />
                      </div>
                    ))}
            </div>
          </section>
    
          {/* Featured Products */}
          <section className="py-6 container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">
              <Skeleton width={200} />
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4)
                    .fill()
                    .map((_, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                        <Skeleton height={50} />
                      </div>
                    ))}
            </div>
          </section>
    
          {/* Footer */}
          <footer className="bg-gray-800 text-white py-6 text-center mt-10">
            <p>&copy; 2025 GullyFoods. All rights reserved.</p>
          </footer>
        </div>
      );
    
}

export default HomePageSkeleton