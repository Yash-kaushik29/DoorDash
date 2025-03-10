import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar';

const OrderDetails = () => {
    const {orderId} = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async() => {
            const {data} = await axios.get(`${process.env.REACT_APP_API_URL}/api/order/getOrderDetails/${orderId}`, {withCredentials: true});
            setOrder(data.order)
            setLoading(false);
        }

        fetchOrderDetails()
    }, [orderId])

    if(loading) return <>Loading....</>

  return (
    <div className='mb-16 lg:mb-0'>
        <Navbar />
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 py-6 px-2 sm:px-6">
      {/* Order Summary */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-4">
        <h2 className="text-2xl font-semibold mb-4">Order #{order?.id}</h2>

        {/* Status Row */}
        <div className="flex justify-between mb-4 text-sm font-medium">
          <span className="bg-blue-200 dark:bg-blue-600 px-2 py-2 rounded">
            Status: {order?.deliveryStatus}
          </span>
          <span className={`${order?.paymentStatus === 'Paid' ? "bg-green-500" : "bg-red-500"} px-2 py-2 rounded`}>
            Payment: {order?.paymentStatus}
          </span>
        </div>

        {/* Shipping Address */}
        <div className="mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          <h3 className="text-lg font-semibold mb-1">Shipping Address</h3>
          <p>{order?.shippingAddress?.name}</p>
          <p>{order?.shippingAddress?.addressLine}</p>
          <p>{order?.shippingAddress?.area}</p>
          <p>Phone: {order?.shippingAddress?.phone}</p>
        </div>

        {/* Items List */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
          <ul className="divide-y divide-gray-300 dark:divide-gray-600">
            {order?.items?.map((item, index) => (
              <li key={index} className="flex justify-between items-center py-3">
                <div className='flex flex-col gap-1'>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{item?.product?.name}</p>
                  <span className="bg-yellow-200 dark:bg-yellow-600 px-2 py-1 rounded text-sm">
                  {item?.product?.shopName}
                </span>
                  <p>
                    Status:{" "}
                    <span
                      className={`mt-1 text-sm font-semibold ${
                        item.status === "Delivered"
                          ? "text-green-600 dark:text-green-400" // ✅ Green for Delivered
                          : item.status === "Cancelled"
                          ? "text-red-600 dark:text-red-400" // ✅ Red for Cancelled
                          : item.status === "Preparing"
                          ? "text-yellow-600 dark:text-yellow-400" // ✅ Yellow for Preparing
                          : "text-blue-600 dark:text-blue-400" // ✅ Blue for any other status
                      }`}
                    >
                      {item.status}
                    </span>
                  </p>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 font-semibold">x{item?.quantity}</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ₹{item?.product?.price * item?.quantity}
                  </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Total Amount */}
        <div className="mt-6 text-xl font-bold text-right text-green-600 dark:text-green-400">
          Total: ₹{order?.amount}
        </div>
      </div>
    </div>
    </div>
  );
}

export default OrderDetails