// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // Import useNavigate

import Login from './components/Login';
import Register from './components/Register';
import Chatbot from './components/Chatbot';
import ProductDashboard from './components/ProductDashboard';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';

// Import AuthProvider and useAuth from your context
import { AuthProvider, useAuth } from './contexts/AuthContext';


// Main application content component
// This component now consumes auth context, so it needs to be inside AuthProvider
function AppContent() {
    // Get user and loading state from AuthContext
    const { user, loading } = useAuth();
    const navigate = useNavigate(); // Initialize useNavigate hook here to allow redirection

    // State for products displayed on the dashboard (passed from chatbot)
    const [productsForDashboard, setProductsForDashboard] = useState([]);
    // Cart state (moved here to make it global for CartPage, ProductDashboard, and Navbar)
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('shoppingCart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error("Failed to parse saved cart from localStorage:", e);
            return [];
        }
    });

    // Save cart to localStorage whenever it changes (global for app)
    useEffect(() => {
        try {
            localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
        } catch (e) {
            console.error("Failed to save cart to localStorage:", e);
        }
    }, [cartItems]);


    // Function to handle products found by chatbot, passed to ProductDashboard
    const handleProductsFoundByChatbot = (products) => {
        setProductsForDashboard(products);
    };

    // Function to clear dashboard products (e.g., when resetting chat)
    const handleClearDashboardProducts = () => {
        setProductsForDashboard([]);
    };

    // Function to add item to cart (passed to ProductDetail and Dashboard)
    const addToCart = (productToAdd) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => String(item.id) === String(productToAdd.id));
            if (existingItem) {
                return prevItems.map(item =>
                    String(item.id) === String(productToAdd.id) ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { ...productToAdd, quantity: 1 }];
            }
        });
        console.log(`${productToAdd.name} added to cart!`);
    };

    // Function to remove item from cart
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => String(item.id) !== String(productId)));
    };

    // Function to update item quantity in cart
    const updateQuantity = (productId, newQuantity) => {
        setCartItems(prevItems => {
            const parsedQuantity = parseInt(newQuantity, 10);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                return prevItems.filter(item => String(item.id) !== String(productId));
            }
            return prevItems.map(item =>
                String(item.id) === String(productId) ? { ...item, quantity: parsedQuantity } : item
            );
        });
    };

    // Function to calculate total amount of items in the cart
    const calculateCartTotal = () => {
        // Returns a string formatted to 2 decimal places
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    // Function to clear the entire cart
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('shoppingCart');
    };

    // Global logout function (used by Navbar)
    const globalHandleLogout = async () => {
        try {
            await signOut(auth); // Direct Firebase signOut
            setProductsForDashboard([]);
            // IMPORTANT: Redirect to the landing page/root after logout
            navigate('/');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Calculate total cart items for Navbar badge
    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);


    // Render loading state while Firebase auth is initializing
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <p className="text-lg text-indigo-700">Loading application...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <Navbar
                user={user}
                onLogout={globalHandleLogout}
                cartItemCount={cartItemCount}
            />

            <h1 className="text-4xl font-bold text-indigo-700 mt-8 mb-8">E-commerce Chatbot</h1>

            <Routes>
                {/* Landing Page Route (for non-logged in users) */}
                {/* If user is logged in, default to Chatbot for the root path */}
                <Route path="/" element={!user ? <LandingPage /> : <Chatbot
                    user={user}
                    onProductsFound={handleProductsFoundByChatbot}
                    onResetChat={handleClearDashboardProducts}
                />} />

                {/* Explicit Chatbot Route - Allows direct navigation to /chat */}
                <Route path="/chat" element={
                    user ? (
                        <Chatbot
                            user={user}
                            onProductsFound={handleProductsFoundByChatbot}
                            onResetChat={handleClearDashboardProducts}
                        />
                    ) : (
                        <div className="text-center p-8 text-red-600">Please log in to use the chat.</div>
                    )
                } />

                {/* Login Route */}
                <Route path="/login" element={
                    user ? (
                        <div className="text-center p-8 text-green-600">You are already logged in!</div>
                    ) : (
                        <Login />
                    )
                } />

                {/* Register Route */}
                <Route path="/register" element={
                    user ? (
                        <div className="text-center p-8 text-green-600">You are already logged in!</div>
                    ) : (
                        <Register />
                    )
                } />

                {/* Product Dashboard Route */}
                <Route
                    path="/dashboard"
                    element={
                        user ? (
                            <ProductDashboard
                                products={productsForDashboard}
                                onSetProducts={setProductsForDashboard}
                                onResetChat={handleClearDashboardProducts}
                                addToCart={addToCart}
                            />
                        ) : (
                            <div className="text-center p-8 text-red-600">Please log in to view the dashboard.</div>
                        )
                    }
                />

                {/* Product Detail Page Route */}
                <Route
                    path="/products/:productId"
                    element={
                        user ? (
                            <ProductDetail
                                products={productsForDashboard}
                                addToCart={addToCart}
                            />
                        ) : (
                            <div className="text-center p-8 text-red-600">Please log in to view product details.</div>
                        )
                    }
                />

                {/* Cart Page Route */}
                <Route
                    path="/cart"
                    element={
                        user ? (
                            <CartPage
                                cartItems={cartItems}
                                removeFromCart={removeFromCart}
                                updateQuantity={updateQuantity}
                                calculateCartTotal={calculateCartTotal}
                                clearCart={clearCart}
                            />
                        ) : (
                            <div className="text-center p-8 text-red-600">Please log in to view your cart.</div>
                        )
                    }
                />
            </Routes>
        </div>
    );
}

// Root component to provide AuthContext and Router
function RootApp() {
    return (
        <Router>
            <AuthProvider> {/* AuthProvider wraps the entire application */}
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default RootApp; // Export RootApp as the main entry point
