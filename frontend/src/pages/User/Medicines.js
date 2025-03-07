import React from 'react';
import Navbar from "../../components/Navbar";
import { Link } from 'react-router-dom';
import { MdOutlineArrowBackIosNew } from "react-icons/md";

const MedicinePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 text-center">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 my-8">
          <h1 className="text-4xl font-bold mb-4 gap-1">Medicines Coming Soon!</h1>
          <p className="text-lg mb-6">
            We are working hard to bring medicines to your doorstep. Stay tuned for updates!
          </p>
          <img 
            src="https://media.istockphoto.com/id/1869353253/photo/coming-soon.webp?a=1&b=1&s=612x612&w=0&k=20&c=UxCbOiajDP4qXNSRSbyU4FIGZHojjZX0wlfdylwJL5A=" 
            alt="Medicines Coming Soon" 
            className="mx-auto rounded-xl shadow-md"
          />
          <p className="mt-6 text-gray-600 dark:text-gray-400">
            Meanwhile, feel free to explore our other categories.
          </p>
        </div>

        {/* Explore Other Categories */}
        <div className="mt-8">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-all"
          >
            <MdOutlineArrowBackIosNew className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedicinePage;
