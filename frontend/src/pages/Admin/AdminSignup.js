import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/signup`, {
        name,
        email,
        password,
        secretKey
      }, { withCredentials: true });

      console.log(data)

      if (data.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
        console.log(err)
      setError('Error creating account. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Signup</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
          <input type="password" placeholder="Secret Key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Signup</button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;