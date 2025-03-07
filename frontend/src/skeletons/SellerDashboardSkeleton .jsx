import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SellerDashboardSkeleton = () => {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header Skeleton */}
        <div className="p-4 bg-white dark:bg-gray-800 shadow-md">
          <Skeleton height={40} width={200} />
        </div>
  
        {/* Welcome Section Skeleton */}
        <div className="max-w-5xl mx-auto p-6 text-center">
          <Skeleton height={30} width={300} />
          <Skeleton height={20} width={250} className="mt-2" />
        </div>
  
        {/* Quick Actions Skeleton */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {Array(3)
            .fill()
            .map((_, index) => (
              <div key={index} className="p-4 rounded-lg shadow-md">
                <Skeleton height={50} />
              </div>
            ))}
        </div>
  
        {/* Stats Section Skeleton */}
        <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3)
            .fill()
            .map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <Skeleton height={20} width={150} />
                <Skeleton height={30} width={100} className="mt-2" />
              </div>
            ))}
        </div>
      </div>
    );
  };
  
  export default SellerDashboardSkeleton;