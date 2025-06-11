// frontend/src/components/ProductDashboard.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function ProductDashboard({
    products,
    onSetProducts, 
    onResetChat,   
    addToCart      
}) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const fetchAllProducts = useCallback(async () => {
        if (!user) {
            console.warn("User not authenticated, cannot fetch products.");
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('http://localhost:5000/api/products', {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            onSetProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }, [user, onSetProducts]);

    useEffect(() => {
        if (!products || products.length === 0) {
            if (user) {
                fetchAllProducts();
            }
        }
    }, [products, user, fetchAllProducts]);

    const uniqueCategories = useMemo(() => {
        if (!products || products.length === 0) {
            return [];
        }
        const categories = new Set(products.map(product => product.category));
        return Array.from(categories).sort();
    }, [products]);

    const filteredAndSortedProducts = useMemo(() => {
        if (!products || products.length === 0) {
            return [];
        }

        let currentProducts = [...products];

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            currentProducts = currentProducts.filter(product =>
                product.name.toLowerCase().includes(lowerSearchTerm) ||
                product.description.toLowerCase().includes(lowerSearchTerm)
            );
        }

        if (selectedCategories.length > 0) {
            currentProducts = currentProducts.filter(product =>
                selectedCategories.includes(product.category)
            );
        }

        currentProducts = currentProducts.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        currentProducts.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'price') {
                comparison = a.price - b.price;
            } else if (sortBy === 'category') {
                comparison = a.category.localeCompare(b.category);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return currentProducts;
    }, [products, searchTerm, selectedCategories, priceRange, sortBy, sortOrder]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handlePriceChange = (index, value) => {
        const newPriceRange = [...priceRange];
        newPriceRange[index] = Number(value);
        setPriceRange(newPriceRange);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategories([]);
        setPriceRange([0, 10000]);
    };

    const handleViewDetails = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleGoToChat = () => {
        navigate('/chat'); // Navigate to the chat interface route
    };

    if (loading) {
        return <div className="text-center p-4">Loading user data...</div>;
    }

    if (!user) {
        return <div className="text-center p-4">Please log in to view the dashboard.</div>;
    }

    return (
        <div className="container mx-auto p-4 flex flex-col lg:flex-row">
            {/* Sidebar for Filters Only */}
            <aside className="lg:w-1/4 p-4 bg-gray-100 rounded-lg shadow-md mb-6 lg:mb-0 lg:mr-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 transition-colors mb-4 lg:hidden"
                >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {(showFilters || window.innerWidth >= 1024) && (
                    <>
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Categories</h3>
                            {uniqueCategories.map(category => (
                                <div key={category} className="flex items-center mb-1">
                                    <input
                                        type="checkbox"
                                        id={category}
                                        value={category}
                                        checked={selectedCategories.includes(category)}
                                        onChange={handleCategoryChange}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor={category} className="ml-2 text-gray-700 text-sm">
                                        {category}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Price Range</h3>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceChange(0, e.target.value)}
                                    className="w-1/2 p-2 border border-gray-300 rounded-md"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceChange(1, e.target.value)}
                                    className="w-1/2 p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Sort By</h3>
                            <div className="flex space-x-2">
                                <select
                                    id="sortBy"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                    <option value="name">Name</option>
                                    <option value="price">Price</option>
                                    <option value="category">Category</option>
                                </select>
                                <select
                                    id="sortOrder"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                    <option value="asc">Asc</option>
                                    <option value="desc">Desc</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="w-full bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </>
                )}
            </aside>

            {/* Product Display Area */}
            <main className="flex-grow">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Available Products</h1>
                    <div className="flex space-x-2"> {/* Container for buttons */}
                        <button
                            onClick={handleGoToChat}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300"
                        >
                            Go to Chat
                        </button>
                        <button
                            onClick={onResetChat}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300"
                        >
                            Reset Products
                        </button>
                    </div>
                </div>

                {filteredAndSortedProducts.length === 0 ? (
                    <p className="text-center text-gray-600 py-10">No products found matching your criteria.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                                <div className="p-5 flex-grow">
                                    <h2 className="font-bold text-xl mb-2 text-gray-900">{product.name}</h2>
                                    <p className="text-indigo-600 text-sm font-semibold mb-2">{product.category}</p>
                                    <p className="text-gray-700 text-base mb-3">{product.description}</p>
                                    <p className="text-gray-900 font-bold text-lg">${product.price.toFixed(2)}</p>
                                </div>
                                <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                    <button
                                        onClick={() => handleViewDetails(product.id)}
                                        className="bg-gray-300 text-gray-800 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors text-sm font-semibold mr-2"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 transition-colors text-sm font-semibold"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default ProductDashboard;
