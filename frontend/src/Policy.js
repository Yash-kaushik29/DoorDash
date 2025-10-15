import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";

const Policy = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pb-20 lg:pb-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-600">
            Privacy Policy
          </h1>

          <p className="mb-4">
            GullyFoods respects your privacy. This policy explains how we
            collect, use, and protect your information.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            1. Information We Collect
          </h2>
          <p className="mb-2">
            We collect your name, phone number, delivery address, and order
            history to provide our services.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            2. How We Use Your Data
          </h2>
          <p className="mb-2">
            Your information is used for order processing, delivery, customer
            support, and app improvement.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">3. Sharing Data</h2>
          <p className="mb-2">
            We do not sell your data. We may share it with our delivery partners
            or for legal requirements.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">4. Security</h2>
          <p className="mb-2">
            We take appropriate measures to protect your data, but cannot
            guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">5. Cookies</h2>
          <p className="mb-2">
            We use cookies for analytics and enhancing user experience.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            6. Shipping Policy
          </h2>
          <p className="mb-2">
            GullyFoods ensures timely delivery through our trusted network of
            sellers and delivery partners. Delivery times may vary depending on
            your location, order volume, and product availability. You will
            receive real-time updates on your order status through the app.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            7. Cancellation & Refund Policy
          </h2>
          <p className="mb-2">
            Orders can be cancelled before they are accepted by the seller or
            before food preparation begins. Once accepted or prepared,
            cancellations may not be possible.
          </p>
          <p className="mb-2">
            In case of failed delivery, wrong items, or quality issues, you can
            request a refund within 24 hours through the app. Refunds are
            processed back to your original payment method within 3–5 business
            days.
          </p>
          <p className="mb-2">
            GullyFoods reserves the right to decline refund requests in cases of
            misuse or violation of our policies.
          </p>

          <h2 className="text-xl font-semibold mt-4 mb-2">
            8. Changes to Policy
          </h2>
          <p className="mb-2">
            We may update this policy. Continued use of the app implies
            acceptance of changes.
          </p>
        </div>
      </div>
    </>
  );
};

export default Policy;
