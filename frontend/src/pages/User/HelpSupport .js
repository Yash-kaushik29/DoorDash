import React from "react";
import Navbar from "../../components/Navbar";
import { MdEmail, MdPhone, MdHelpOutline } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const HelpSupport = () => {
  const faqs = [
    {
      question: "How can I place an order?",
      answer:
        "You can place an order by browsing the products, adding them to your cart, and proceeding to checkout.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept cash on delivery, and online payment through Razorpay.",
    },
    {
      question: "How do I track my order?",
      answer:
        "You can track your order status in the 'Orders' section of your profile.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex justify-center items-start p-4 pb-20">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-10">
          <h1 className="text-4xl font-bold text-center">Help & Support</h1>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-8">
            We're here to assist you
          </p>

          {/* FAQs Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
            <ul className="space-y-4">
              {faqs.map((faq, index) => (
                <li
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <h3 className="font-semibold text-lg flex items-center">
                    <MdHelpOutline className="mr-2 text-green-500" />
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm">{faq.answer}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Support Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              If you need further assistance, reach out to us:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 flex items-center">
                <MdEmail className="text-2xl text-green-500 mr-4" />
                <span>doordash@gmail.com</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 flex items-center">
                <MdPhone className="text-2xl text-green-500 mr-4" />
                <span>+91 9876543210</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-4 flex items-center">
                <FaWhatsapp className="text-2xl text-green-500 mr-4" />
                <span>Contact via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpSupport;
