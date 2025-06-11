// frontend/src/components/CartPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import { toast } from 'react-toastify';// Import useAuth to get user for checkout API call

function CartPage({
    cartItems,
    removeFromCart,   // Prop from App.js
    updateQuantity,   // Prop from App.js
    calculateCartTotal, // Prop from App.js: This function will now be used
    clearCart         // Prop from App.js
}) {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user from AuthContext for authenticated checkout

    const handleContinueShopping = () => {
        navigate('/dashboard'); // Go back to dashboard
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        if (!user) {
            toast.success("You must be logged in to proceed to checkout.");
            navigate('/login');
            return;
        }

        // Call calculateCartTotal without .toFixed() here, as it already returns a formatted string
        const confirmCheckout = window.confirm(`Proceed to checkout with ${cartItems.length} items for a total of $${calculateCartTotal()}?`);
        if (!confirmCheckout) {
            return;
        }

        try {
            const idToken = await user.getIdToken(); // Get the user's ID token
            const response = await fetch('http://localhost:5000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // Send token for authentication
                },
                body: JSON.stringify({ cartItems: cartItems })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order');
            }

            const result = await response.json();
            alert(`Order placed successfully! Order ID: ${result.order_id}, Total: $${result.total_amount}`);
            clearCart(); // Clear the cart after successful checkout via prop
            navigate('/dashboard'); // Redirect to dashboard or an order confirmation page
        } catch (error) {
            console.error("Checkout error:", error);
            alert(`Checkout failed: ${error.message}`);
        }
    };

    return (
        <div className="container mx-auto p-4 bg-white rounded-lg shadow-xl mt-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Your Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                    <p className="text-lg mb-4">Your cart is empty.</p>
                    <button
                        onClick={handleContinueShopping}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div>
                    <ul className="divide-y divide-gray-200 mb-6">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)} each</p>
                                </div>
                                <div className="text-right flex items-center space-x-4">
                                    {/* Input for quantity update */}
                                    <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity for {item.name}</label>
                                    <input
                                        type="number"
                                        id={`quantity-${item.id}`}
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                        className="w-20 p-2 border border-gray-300 rounded-md text-center text-base"
                                    />
                                    <p className="text-md font-semibold text-gray-800">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                        aria-label={`Remove ${item.name} from cart`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </ul>

                    <div className="text-right text-2xl font-bold text-indigo-800 border-t-2 border-gray-200 pt-4 mt-6">
                        Total: ${calculateCartTotal()} {/* Removed .toFixed(2) here */}
                    </div>

                    <div className="flex justify-evenly mt-4">
                        <button
                            onClick={handleContinueShopping}
                            className="w-52 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300"
                        >
                            Continue Shopping
                        </button>
                        <button
                            onClick={handleCheckout}
                            className="w-52 bg-green-600 hover:bg-green-700  text-white font-bold py-2 px-4 rounded-md transition duration-300"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;
