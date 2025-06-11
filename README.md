🛍️ E-commerce Sales Chatbot

📌 Project Overview

This project implements a full-stack E-commerce Sales Chatbot designed to enhance the online shopping experience by enabling efficient product search, exploration, and purchase processes.

🔹 Frontend: Responsive React-based interface.

🔹 Backend: API-driven Flask application.

🔹 Authentication: Integrated via Firebase.

🔹 Database: SQLite for storing product, chat, and order data.

🎯 The chatbot streamlines customer interaction and makes product discovery intuitive.

🚀 Features

🖥️ Frontend (React)

Responsive UI: Works seamlessly on desktop, tablet, and mobile devices.

User Authentication: Login and register securely via Firebase Authentication.

Session Management: Cart and user state stored in browser localStorage.

💬 Chatbot Interface
Accepts natural language product queries.

Chat reset functionality.

Timestamps for all messages.

View past chat history (text only).

Dynamically redirects to Product Dashboard with filtered results.

🛒 Product Dashboard

Displays product cards with detailed info.

Filtering:

By search term

By categories

By price range

Sorting:

By name

By price

By category

Add to Cart directly from listings.

📄 Product Detail Page

Dedicated page for viewing individual product details.

🛍️ Cart Management

View all added items.

Update product quantities.

Remove items from cart.

Display total cart amount.

Cart Persistence: Cart data saved in localStorage (even after logout).

💳 Checkout Process

Sends order to backend.

Cart clears upon successful order placement.

🧭 Navigation

Seamless routing between Chatbot, Dashboard, Product Details, and Cart.

Logout redirects to landing page.

🖥️ Backend (Flask API)

RESTful API to serve frontend requests.

Firebase Token Verification on all protected routes.

📦 Product Management

Fetches product data from SQLite database.

Supports dynamic filtering/search based on chatbot queries.

🧠 Chat History

Stores each user query and chatbot reply.

📑 Order Management

Orders stored in orders table.

Each product in order saved in order_items table.

🗄️ SQLite Database

Lightweight and pre-populated with 200+ mock products on first run.

🧰 Technology Stack

🔧 Frontend

React – UI framework

React Router DOM – Routing

Tailwind CSS – Styling

Firebase JS SDK – Auth

🔧 Backend

Flask – RESTful backend

Flask-CORS – CORS handling

SQLite3 – Embedded DB

Firebase Admin SDK – Token verification

python-dotenv – Environment variable management

⚙️ Installation and Setup

✅ Prerequisites

Node.js (LTS) + npm

Python 3.8+ + pip

🔐 Firebase Setup

Create a Firebase project in Firebase Console

Enable Email/Password Authentication

Download Service Account JSON Key:

Go to Project Settings → Service Accounts

Click Generate new private key

Save as serviceAccountKey.json inside /backend/

Get Firebase Web App Config:

apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId

📁 Project Structure
```
ecommerce-chatbot/
├── backend/
│   ├── app.py
│   ├── serviceAccountKey.json
│   ├── ecommerce.db
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── firebaseConfig.js
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

🛠️ Backend Setup
```
cd ecommerce-chatbot/backend
python -m venv venv
# Activate venv:
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
```
🧑‍💻 Frontend Setup
```
cd ecommerce-chatbot/frontend
npm install
```

🔑 Create firebaseConfig.js inside frontend/src/
```
// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app };
```
▶️ Running the Application

🔃 Start Backend
```
cd ecommerce-chatbot/backend
# Activate venv again if needed
python app.py
```
🌐 Start Frontend
```
cd ecommerce-chatbot/frontend
npm start
```
🔗 API Endpoints

The backend exposes the following RESTful API endpoints:

POST /api/register: Register a new user with email and password (handled by Firebase).

POST /api/login: Authenticate a user with email and password (handled by Firebase).

GET /api/products: (Protected) Retrieves all products from the database.

Requires Authorization: Bearer <Firebase ID Token> header.

POST /api/chatbot: (Protected) Processes user queries, performs product search in the database, and returns a chatbot response along with relevant product data.

Requires Authorization: Bearer <Firebase ID Token> header.

Request Body:
```
{"query": "your user query"}
```
Response:
```
{"response": "chatbot text", "products": [...]}
```
GET /api/chat_history: (Protected) Retrieves past chat history for the authenticated user.

Requires Authorization: Bearer <Firebase ID Token> header.

POST /api/checkout: (Protected) Processes a user's shopping cart, records the order in the database, and simulates payment.

Requires Authorization: Bearer <Firebase ID Token> header.

Request Body:
```
{"cartItems": [{"id": 1, "quantity": 2, "price": 100}, ...]}
```
🗃️ Database Schema
The ecommerce.db SQLite database contains the following tables:

products
id (INTEGER PRIMARY KEY AUTOINCREMENT)

name (TEXT)

category (TEXT)

price (REAL)

description (TEXT)

chat_history
id (INTEGER PRIMARY KEY AUTOINCREMENT)

user_id (TEXT): Firebase UID of the user.

timestamp (TEXT): ISO format of when the interaction occurred.

query (TEXT): User's input.

response (TEXT): Chatbot's response.

orders

id (INTEGER PRIMARY KEY AUTOINCREMENT)

user_id (TEXT): Firebase UID of the user who placed the order.

order_date (TEXT): ISO format of the order placement date.

total_amount (REAL)

status (TEXT): e.g., 'pending', 'completed'.

order_items

id (INTEGER PRIMARY KEY AUTOINCREMENT)

order_id (INTEGER): Foreign key referencing orders.id.

product_id (INTEGER): Foreign key referencing products.id.

quantity (INTEGER)

price_at_purchase (REAL): Price of the product at the time of purchase.

🔐 Authentication Details

Authentication is handled by Firebase.

Users register and log in via the Firebase SDK on the frontend.

Upon successful login, an ID token is obtained.

This ID token is then sent with every authenticated request to the Flask backend in the Authorization: Bearer <ID_TOKEN> header.

The Flask backend uses the Firebase Admin SDK to verify these tokens, ensuring that only authenticated and authorized users can access protected resources.

🧪 Usage Examples

Register/Login

Create a new account or log in with an existing one.

Chat with the Bot

"Hello!"

"Search for laptop"

"Find me some books"

"Show all products"

"What categories do you have?"

"Thank you!"

Explore Products

Click "View Details" from the dashboard.

Use filters (search, category, price) and sorting.

Add to Cart

Click "Add to Cart" on product cards in the dashboard or product detail page.

Your cart items will persist even after logging out.

Manage Cart

Navigate to the Cart icon in the Navbar.

Adjust quantities or remove items.

Checkout

From the Cart page, click "Proceed to Checkout" to simulate an order.

🌟 Potential Future Enhancements

Advanced AI Chatbot: Integrate a more powerful LLM (e.g., Gemini API) for more nuanced conversational abilities and product recommendations.

Image Generation: Allow the chatbot to generate images of products based on descriptions using models like Imagen.

Persistent Chat History with Products: Extend the backend chat_history table to store the actual product data returned for each query, enabling historical "View Products" links to display the exact items.

Real-time Updates: Implement WebSockets for real-time chat updates or cart synchronization across multiple devices.

Payment Gateway Integration: Integrate with a real payment processing service (e.g., Stripe, PayPal) for actual transactions.

User Profiles/Order History: Develop pages for users to view their past orders and update profile information.

Admin Dashboard: A backend interface for managing products, viewing orders, and analyzing chat data.

Product Images: Integrate actual product images (stored in a cloud storage service like Firebase Storage or AWS S3) rather than placeholders.

🛠️ Challenges Faced and Solutions

Frontend-Backend Communication & CORS

Challenge: Initial fetch requests from React to Flask were blocked by CORS policies.

Solution: Implemented Flask-CORS on the backend to allow cross-origin requests from the frontend's domain.

Firebase Authentication & Token Management

Challenge: Securely authenticating requests from the React frontend to the Flask backend.

Solution: Utilized Firebase's ID Tokens. The frontend obtains the token, and the backend uses the Firebase Admin SDK to verify_id_token(), ensuring the request is from an authenticated and valid user.

State Management in React (Cart & Products)

Challenge: Maintaining cart state across different components and ensuring product data from the chatbot is consistently available to the dashboard and product details.

Solution: Centralized cartItems and productsForDashboard state in App.js and passed necessary functions (addToCart, onProductsFound, onSetProducts) as props. Utilized localStorage for cart persistence.

Chatbot Product Filtering Logic

Challenge: Ensuring the chatbot accurately filters products from the database based on user queries, without defaulting to all products after a "reset" or general inquiry.

Solution: Implemented dynamic SQL query construction in the Flask backend's /api/chatbot endpoint, parsing user input for relevant keywords and searching across name, category, and description fields. Explicitly handled "all products" and general greetings.

Navigation and Routing Flow

Challenge: Ensuring smooth navigation between pages and correct redirects (e.g., after login/logout, or from chatbot to dashboard).

Solution: Extensively used react-router-dom's useNavigate hook for programmatic navigation and controlled rendering based on user authentication status. Configured explicit routes for all major pages.

Debugging Async Operations (Firebase, Fetch)

Challenge: Handling asynchronous operations for Firebase authentication and API calls, especially with useEffect and useState hooks, to avoid race conditions or incorrect state updates.

Solution: Careful use of async/await, dependency arrays in useEffect and useCallback, and adding loading states and error handling (try-catch) to provide better user feedback.

✍️ Author

Samruddhi R.
