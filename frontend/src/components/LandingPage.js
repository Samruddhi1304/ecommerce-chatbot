// frontend/src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-6 bg-gray-100"> {/* Adjust min-h to account for Navbar and main title */}
      <div className="text-center bg-white p-10 rounded-lg shadow-xl max-w-2xl">
        <h2 className="text-4xl font-extrabold text-indigo-800 mb-6">
          Your Smart Shopping Companion
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          Welcome to our advanced E-commerce Chatbot! We're here to revolutionize your shopping experience.
          Effortlessly search for products, get instant recommendations, and receive personalized assistance
          through our intuitive conversational interface. Whether you're looking for the latest gadgets or
          everyday essentials, our chatbot makes finding exactly what you need a breeze.
        </p>
        <p className="text-xl font-semibold text-indigo-600 mb-8">
          Ready to start exploring?
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-md hover:shadow-lg"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-md hover:shadow-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;