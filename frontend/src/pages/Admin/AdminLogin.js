import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/login`, {
        email,
        password,
        secretKey
      }, { withCredentials: true });

      if (data.success) {
        navigate('/admin/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Invalid credentials or server error');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
          <input type="password" placeholder="Secret Key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required className="w-full p-2 border border-gray-300 rounded" />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;