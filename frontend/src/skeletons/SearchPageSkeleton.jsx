import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SearchPageSkeleton = () => {
  return (
    <div>
      <section className="bg-white dark:bg-gray-800">
         <Skeleton width="100%" height={40} />
      </section>  
      
      <section className="py-6 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8)
            .fill()
            .map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center"
              >
                <Skeleton height={50} />
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default SearchPageSkeleton;
