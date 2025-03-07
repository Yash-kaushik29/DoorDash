import { useState } from "react";
import { motion } from "framer-motion";
import axios from 'axios';
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import {Link, useNavigate} from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. ❌");
      return;
    }
  
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/user-signup`, {formData}, { withCredentials: true });
      
      if(response.data.success) {
        toast.success("Signup Successful! 🎉");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      else {
        toast.error(response.data.message + " ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Signup Failed. Please try again. ❌");
    }
  };
  

  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
    <div 
  className="flex justify-center items-center min-h-screen p-4 bg-cover bg-center bg-no-repeat bg-green-200"
  style={{ backgroundImage: "url('/bg.jpg')", backgroundSize: "contain" }}
>

      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-6 shadow-xl rounded-2xl backdrop-blur-lg bg-opacity-90"
      >
        <h2 className="text-2xl text-center text-green-600 font-bold mb-4">Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-green-600 mb-1">Name</label>
            <input name="username" value={formData.username} onChange={handleChange} required className="w-full border border-green-300 p-2 rounded focus:ring-green-600 focus:border-green-600 focus:outline-none dark:text-gray-800" />
          </div>
          <div>
            <label className="block text-green-600 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-green-300 p-2 rounded focus:ring-green-600 focus:border-green-600 focus:outline-none dark:text-gray-800" />
          </div>
          <div>
            <label className="block text-green-600 mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full border border-green-300 p-2 rounded focus:ring-green-600 focus:border-green-600 focus:outline-none dark:text-gray-800" />
          </div>
          <div>
            <label className="block text-green-600 mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full border border-green-300 p-2 rounded focus:ring-green-600 focus:border-green-600 focus:outline-none dark:text-gray-800" />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            type="submit" 
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-800"
          >
            Sign Up
          </motion.button>
        </form>

        <div className="text-center mt-4 dark:text-gray-800" >Already have an account! <Link to='/login' ><span className="text-green-600 font-semibold hover:underline cursor-pointer ml-1" >Login</span></Link></div>
      </motion.div>
    </div>
    </>
  );
}