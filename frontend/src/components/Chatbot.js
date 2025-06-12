// frontend/src/components/Chatbot.js
import React, { useState, useEffect, useRef, useCallback } from 'react'; // useCallback is imported and used
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // useAuth is imported and used

// Helper function to format timestamp for individual messages
const formatMessageTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', options);
};

// Helper function to get a date label for grouping (Today, Yesterday, or specific date)
const getDateLabel = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();

    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = Math.abs(nowOnly.getTime() - dateOnly.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays === 1) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }
};

function Chatbot({ user, onProductsFound, onResetChat, initialMessage = "Hello! How can I help you today?" }) {
    const { user: authUser } = useAuth(); // Use a different name to avoid prop vs hook variable collision if 'user' is also a prop
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null); // Ref for current messages scrolling
    const historyEndRef = useRef(null); // Ref for history section scrolling

    const [messages, setMessages] = useState(() => {
        const savedMessages = sessionStorage.getItem('chatMessages');
        try {
            return savedMessages ? JSON.parse(savedMessages) : [{ text: initialMessage, sender: 'bot', timestamp: new Date().toISOString() }];
        } catch (e) {
            console.error("Failed to parse saved chat messages from sessionStorage:", e);
            return [{ text: initialMessage, sender: 'bot', timestamp: new Date().toISOString() }];
        }
    });

    const [pastChatHistory, setPastChatHistory] = useState([]);
    const [showPastChatHistory, setShowPastChatHistory] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToHistoryBottom = () => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (showPastChatHistory) {
            scrollToHistoryBottom();
        }
    }, [pastChatHistory, showPastChatHistory]);

    useEffect(() => {
        try {
            sessionStorage.setItem('chatMessages', JSON.stringify(messages));
        } catch (e) {
            console.error("Failed to save chat messages to sessionStorage:", e);
        }
    }, [messages]);

    const fetchPastChatHistory = useCallback(async () => { // useCallback for this function
        // Use authUser from useAuth() hook for API calls
        if (!authUser) {
            setHistoryError("Please log in to view your past chat history.");
            setPastChatHistory([]);
            return;
        }

        setIsHistoryLoading(true);
        setHistoryError(null);
        try {
            const idToken = await authUser.getIdToken();
            const response = await fetch('http://localhost:5000/api/chat_history', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || response.statusText);
            }

            const history = await response.json();
            const formattedHistory = history.map(item => [
                { sender: 'user', text: item.query, type: 'text', timestamp: item.timestamp },
                { sender: 'bot', text: item.response, type: 'text', timestamp: item.timestamp }
                // Note: The backend's chat_history table doesn't store 'products' for history items directly.
                // If you want to enable "View Products" from historical chat, the backend's history
                // would need to store the products found for that query, or you'd re-run the search.
                // For simplicity here, past chat history links will just navigate to dashboard without specific products.
            ]).flat();

            setPastChatHistory(formattedHistory);

        } catch (error) {
            console.error("Error fetching past chat history:", error);
            setHistoryError(`Failed to load history: ${error.message}.`);
            setPastChatHistory([]);
        } finally {
            setIsHistoryLoading(false);
        }
    }, [authUser]); // Dependency: authUser

    const handleTogglePastChatHistory = () => {
        if (!authUser) { // Use authUser for check
            alert("Please log in to view your past chat history.");
            return;
        }
        setShowPastChatHistory((prev) => !prev);
        if (!showPastChatHistory) { // If it's about to be shown, fetch history
            fetchPastChatHistory();
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        const userQueryText = input.trim();
        const userMessage = { sender: 'user', text: userQueryText, type: 'text', timestamp: new Date().toISOString() };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');

        // Clear dashboard products temporarily before new search results
        onProductsFound([]);

        try {
            if (!authUser) { // Use authUser for check
                setMessages(prevMessages => [...prevMessages, { text: "Please log in to use the chatbot.", sender: 'bot', timestamp: new Date().toISOString() }]);
                return;
            }
            const idToken = await authUser.getIdToken();

            const response = await fetch('http://localhost:5000/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ query: userQueryText })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    setMessages(prevMessages => [...prevMessages, { text: "Your session has expired or you are unauthorized. Please log in again.", sender: 'bot', timestamp: new Date().toISOString() }]);
                }
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();

            const botMessage = { sender: 'bot', text: data.response, type: 'text', timestamp: new Date().toISOString() };
            setMessages((prevMessages) => [...prevMessages, botMessage]);

            if (data.products && data.products.length > 0) {
                // Store the actual products in the message object
                setMessages((prevMessages) => [...prevMessages, {
                    sender: 'bot',
                    type: 'products_link',
                    text: `Found ${data.products.length} products. Click below to view them!`,
                    productsCount: data.products.length,
                    productsData: data.products, // <<< PRODUCTS STORED HERE
                    timestamp: new Date().toISOString()
                }]);
            }

        } catch (error) {
            console.error("Error sending message to chatbot:", error);
            const errorMessage = { sender: 'bot', text: `Error: ${error.message}. Please try again.`, type: 'text', timestamp: new Date().toISOString() };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            onProductsFound([]); // Ensure dashboard is cleared if error prevents product display
        }
    };

    // handleViewProductsClick now takes the specific products array
    const handleViewProductsClick = (event, productsToShow) => {
        event.stopPropagation();
        onProductsFound(productsToShow); // Pass the specific products to App.js
        navigate('/dashboard'); // Use the 'navigate' hook directly
    };

    const handleResetChat = () => {
        setMessages([{ text: initialMessage, sender: 'bot', timestamp: new Date().toISOString() }]);
        sessionStorage.removeItem('chatMessages');
        onResetChat(); // Clear dashboard products and any other app-wide resets
        setShowPastChatHistory(false);
        setPastChatHistory([]);
        setHistoryError(null);
        navigate('/'); // Use the 'navigate' hook directly
        alert("Current chat cleared!"); // Using alert for now, consider a custom modal
    };

    let lastDateLabel = ""; // To keep track of the last date label rendered for history

    return (
        <div className="flex flex-col h-[600px] w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden relative">
            <div className="flex items-center justify-between p-4 bg-indigo-600 text-white shadow-md">
                <h2 className="text-xl font-semibold">Product Chatbot</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handleTogglePastChatHistory}
                        className="bg-purple-400 hover:bg-purple-500 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm transition duration-300"
                    >
                        {showPastChatHistory ? 'Hide Past Chats' : 'View Past Chats'}
                    </button>
                    <button
                        onClick={handleResetChat}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm transition duration-300"
                    >
                        Reset Current Chat
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">Type a message to start chatting!</p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`max-w-[80%] p-3 rounded-lg shadow-sm text-sm relative ${
                                msg.sender === 'user'
                                    ? 'bg-[#597cdb] text-white ml-auto rounded-br-none'
                                    : msg.type === 'products_link'
                                        ? 'bg-green-100 text-green-800 text-center mr-auto rounded-bl-none'
                                        : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-none'
                            }`}
                        >

                            {msg.text}
                            {msg.type === 'products_link' && (
                                <button
                                    className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md transition duration-300 w-full cursor-pointer"
                                    // Pass the stored productsData for current chat product links
                                    onClick={(e) => handleViewProductsClick(e, msg.productsData || [])}
                                >
                                    View {msg.productsCount} Products
                                </button>
                            )}
                            {msg.timestamp && (
                                <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white text-right' : 'text-gray-500 text-left'}`}>
                                    {formatMessageTimestamp(msg.timestamp)}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Past Chat History Panel (Conditional Rendering) */}
            {showPastChatHistory && (
                <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-10 flex flex-col p-4">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-4 text-center">Past Conversations</h3>
                    <div className="flex-grow overflow-y-auto space-y-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                        {isHistoryLoading && (
                            <p className="text-center text-gray-500">Loading past conversations...</p>
                        )}
                        {historyError && (
                            <p className="text-center text-red-500">{historyError}</p>
                        )}
                        {!isHistoryLoading && !historyError && pastChatHistory.length === 0 && (
                            <p className="text-center text-gray-500">No past conversations found.</p>
                        )}
                        {!isHistoryLoading && !historyError && pastChatHistory.length > 0 && (
                            // Iterate through pastChatHistory to display messages with date grouping
                            pastChatHistory.map((msg, index) => {
                                const currentDateLabel = getDateLabel(msg.timestamp);
                                const renderDateHeader = currentDateLabel !== lastDateLabel;
                                if (renderDateHeader) {
                                    lastDateLabel = currentDateLabel;
                                }

                                return (
                                    <React.Fragment key={`history-${index}`}>
                                        {renderDateHeader && (
                                            <div className="text-center my-3">
                                                <span className="inline-block bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                                                    {currentDateLabel}
                                                </span>
                                            </div>
                                        )}
                                       <div
                                            className={`max-w-[80%] p-3 rounded-lg shadow-sm text-sm relative ${
                                                msg.sender === 'user'
                                                    ? 'bg-[#597cdb] text-white ml-auto rounded-br-none'
                                                : msg.type === 'products_link'
                                                    ? 'bg-green-100 text-green-800 text-center mr-auto rounded-bl-none'
                                                    : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-none'
                                            }`}
                                        >
                                            {msg.text}
                                            {/* For historical links, we don't have productsData stored in the backend history currently.
                                                So, clicking these will just navigate to the dashboard which will then fetch all products.
                                                A more robust solution would store products in the chat_history table in the backend.
                                            */}
                                            {msg.type === 'products_link' && (
                                                <button
                                                    className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md transition duration-300 w-full cursor-pointer"
                                                    onClick={(e) => { e.stopPropagation(); navigate('/dashboard'); }}
                                                >
                                                    View Products (History)
                                                </button>
                                            )}
                                            {msg.timestamp && (
                                                <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-gray-500 text-left'}`}>
                                                    {formatMessageTimestamp(msg.timestamp)}
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })
                        )}
                        <div ref={historyEndRef} />
                    </div>
                    <button
                        onClick={handleTogglePastChatHistory}
                        className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                    >
                        Close History
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} className="flex p-4 border-t border-gray-200 bg-gray-100">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about products..."
                    className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                    required
                />
                <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-r-lg focus:outline-none focus:shadow-outline transition duration-300"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chatbot;