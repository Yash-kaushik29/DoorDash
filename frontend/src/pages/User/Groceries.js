import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import axios from 'axios';
import { toast } from 'react-toastify';
import ShopCard from '../../components/ShopCard';

const Groceries = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useState(() => {
  }, [])
  
  return (
    <div>
      <Navbar />
      
      <section className="py-6 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Grocery Shops Near You:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shops &&
            shops.map((shop, index) => <ShopCard key={index} shop={shop} />)}
        </div>
      </section>
    </div>
  );
}

export default Groceries