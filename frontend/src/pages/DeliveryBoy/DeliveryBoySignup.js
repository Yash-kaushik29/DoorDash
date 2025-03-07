import React, { useState } from 'react';
import axios from 'axios';

const DeliveryBoySignup = () => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('http://localhost:5000/api/delivery/signup', {
        username,
        phone,
        password,
        secretKey,
      });
      setSuccess('Account created successfully');
    } catch (err) {
      setError('Signup failed. Please check your details and try again.');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-900 text-white'>
      <div className='w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold mb-4'>Delivery Boy Signup</h2>
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='w-full p-2 mb-4 bg-gray-700 rounded text-white'
        />
        <input
          type='text'
          placeholder='Phone Number'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className='w-full p-2 mb-4 bg-gray-700 rounded text-white'
          maxLength='10'
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full p-2 mb-4 bg-gray-700 rounded text-white'
        />
        <input
          type='password'
          placeholder='Secret Key'
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          className='w-full p-2 mb-4 bg-gray-700 rounded text-white'
        />
        <button
          onClick={handleSignup}
          className='w-full bg-blue-500 py-2 rounded hover:bg-blue-600'
        >
          Create Account
        </button>
        {error && <p className='text-red-500 mt-4'>{error}</p>}
        {success && <p className='text-green-500 mt-4'>{success}</p>}
      </div>
    </div>
  );
};

export default DeliveryBoySignup;
