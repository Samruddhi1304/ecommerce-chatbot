// frontend/src/components/ProductDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Make sure addToCart is received as a prop here
function ProductDetail({ products, addToCart }) {
    const { productId } = useParams(); // Get the productId from the URL (it will be a string)
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (products && products.length > 0) {
            // FIX: Convert p.id to a string for comparison to match productId from URL
            const foundProduct = products.find(p => String(p.id) === productId);
            setProduct(foundProduct);
            setLoading(false);
        } else {
            setLoading(false);
            setProduct(null);
        }
    }, [productId, products]);

    // New handler function for the Add to Cart button
    const handleAddToCartClick = () => {
        if (product) {
            // Call the addToCart function passed from App.js
            addToCart(product);
        }
    };

    if (loading) {
        return (
            <div className="text-center text-gray-500 py-8">
                <p>Loading product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center text-red-600 py-8 max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <p className="mb-4">Product not found!</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto my-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-indigo-700 mb-4">{product.name}</h2>
            <div className="text-lg text-gray-800 mb-2">
                <span className="font-semibold">Category:</span> {product.category}
            </div>
            <div className="text-2xl font-bold text-green-600 mb-4">
                Price: ${product.price.toFixed(2)}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

            <div className="flex justify-between mt-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                    Back to Dashboard
                </button>
                <button
                    // Use the new handler to call addToCart prop
                    onClick={handleAddToCartClick}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ml-4"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}

export default ProductDetail;