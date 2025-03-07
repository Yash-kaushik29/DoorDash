import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductListCardSkeleton = () => {
  return (
    <div className='px-4' >
     <div className='mb-5' >
        <Skeleton width="100%" height={60} />
     </div>   
     <Skeleton width={100} height={24}  />
     <Skeleton width="100%" height={40} />   
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
    {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="max-w-xs bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
        <Skeleton height={192} />
  
        <div className="p-4">
          <Skeleton width="80%" height={24} />
  
          <Skeleton width="60%" height={20} className="mt-2" />
  
          <div className="flex space-x-2 mt-4">
            <Skeleton width="50%" height={36} />
            <Skeleton width="50%" height={36} />
          </div>
        </div>
      </div>
    ))}
    </div>
    </div>
  );
};

export default ProductListCardSkeleton;
