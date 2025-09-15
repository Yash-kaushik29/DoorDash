import React from 'react'
import { Link } from 'react-router-dom'

const ShopCard = ({shop}) => {
  return (
    <Link to={`/shop/${shop._id}`}>
      <div className="flex flex-col items-center text-center space-y-2 w-32 h-32">
        <img
          src={shop.images[0]}
          alt={shop.name}
          className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-sm"
        />
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
          {shop.name}
        </h3>
      </div>
    </Link>
  )
}

export default ShopCard
