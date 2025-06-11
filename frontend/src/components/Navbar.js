// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

// Make sure to accept the cartItemCount prop here
function Navbar({ user, onLogout, cartItemCount }) {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Simple cart icon SVG for demonstration.
  // You can replace this with an icon from a library like react-icons if you have one setup.
  const CartIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6" // Tailwind classes for size
    >
      <path fillRule="evenodd" d="M7.5 6V5.25a2.25 2.25 0 0 1 2.25-2.25h4.5a2.25 2.25 0 0 1 2.25 2.25V6h3.625a2.25 2.25 0 0 1 2.247 2.11L22 17.25a2.25 2.25 0 0 1-2.247 2.39H4.247A2.25 2.25 0 0 1 2 17.25L2.128 8.11A2.25 2.25 0 0 1 4.375 6H7.5Zm-.875 9.75a.75.75 0 0 0 .75.75h9.75a.75.75 0 0 0 .75-.75V8.25a.75.75 0 0 0-.75-.75H7.375a.75.75 0 0 0-.75.75v7.5Zm3-9h3v-.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v.75Z" clipRule="evenodd" />
    </svg>
  );

  return (
    <nav className="bg-indigo-700 p-4 text-white shadow-lg w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/" className="hover:text-gray-300 transition duration-300">E-commerce Chatbot</Link>
        </div>
        <div className="flex items-center space-x-6">

          {/* Cart Icon and Count */}
          <div className="relative">
            <button
              onClick={() => navigate('/cart')} // CHANGED: Now navigates to the /cart route
              className="relative hover:text-indigo-200 transition-colors"
            >
              <CartIcon />
              {/* Cart item count badge */}
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-indigo-700">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {user ? ( // If user is logged in
            <>
              <span className="text-sm">Welcome, <span className="font-semibold">{user.email}</span></span>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-300"
              >
                Logout
              </button>
            </>
          ) : ( // If user is NOT logged in
            <>
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;