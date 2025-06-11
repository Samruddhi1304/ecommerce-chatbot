// frontend/src/components/Register.js
import React, { useState } from 'react';
import { auth } from '../../../frontend/src/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
      e.preventDefault();
      setError('');
      try {
          await createUserWithEmailAndPassword(auth, email, password);
          // alert('Registered successfully! You are now logged in.'); // <--- REMOVED THIS LINE
          setEmail('');
          setPassword('');
          navigate('/');
      } catch (err) {
          console.error("Registration error:", err);
          setError(err.message);
      }
  };

  return (
    <div className="w-full max-w-md p-8 bg-gray-50 rounded-lg shadow-xl border border-purple-100 transform hover:scale-105 transition-all duration-300">
      <h2 className="text-3xl font-extrabold text-purple-700 mb-6 text-center">Register</h2>
      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email:
          </label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
            placeholder="choose.email@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password:
          </label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
            placeholder="••••••••"
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300 text-lg"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;