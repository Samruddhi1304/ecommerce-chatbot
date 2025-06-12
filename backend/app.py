# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from dotenv import load_dotenv
from functools import wraps
import re
from datetime import datetime
import random # Import random for generating mock data
import json # Required for parsing JSON from environment variable (though now we prefer file path)

# Import Firebase Admin SDK modules
import firebase_admin
from firebase_admin import credentials, auth

# Load environment variables from .env file (for local development)
load_dotenv()

# --- Flask App Initialization ---
app = Flask(__name__)

# UPDATED: CORS origin set to your Vercel frontend URL
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://ecommerce-chatbot-chi.vercel.app"]}})


# --- Firebase Admin SDK Configuration ---
try:
    if not firebase_admin._apps: # Check if app is already initialized
        # Try to load credentials from a file path specified by GOOGLE_APPLICATION_CREDENTIALS env var
        # This is the recommended method for production deployments.
        service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            print(f"Firebase credentials loaded from GOOGLE_APPLICATION_CREDENTIALS path: {service_account_path}")
        else:
            # Fallback for local development if GOOGLE_APPLICATION_CREDENTIALS env var is not set
            # or the path it points to does not exist.
            # REMINDER: Ensure serviceAccountKey.json is in your .gitignore for local dev!
            SERVICE_ACCOUNT_KEY_PATH = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
            if os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
                cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
                print(f"Firebase credentials loaded from local file: {SERVICE_ACCOUNT_KEY_PATH}")
            else:
                # If neither a valid env var path nor a local file is found, raise an error
                raise Exception("Firebase service account credentials not found. Please ensure GOOGLE_APPLICATION_CREDENTIALS env var is set correctly for deployment, or serviceAccountKey.json exists for local development.")

        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully.")
    else:
        print("Firebase Admin SDK already initialized.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # It's better to exit if Firebase initialization fails in a production environment
    exit(1)


# --- SQLite Database Setup ---
# UPDATED: Use RENDER_DISK_PATH environment variable for persistent storage on Render (this part is specific to Render,
# but can be adapted for PythonAnywhere by ensuring DATABASE path is writable)
DATABASE = 'ecommerce.db'


def get_db_connection():
    try:
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row # This makes rows behave like dictionaries
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                timestamp TEXT NOT NULL,
                query TEXT NOT NULL,
                response TEXT NOT NULL
            )
        ''')
        # --- NEW TABLES FOR CHECKOUT ---
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                order_date TEXT NOT NULL,
                total_amount REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending' -- e.g., pending, completed, cancelled
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price_at_purchase REAL NOT NULL, -- Price at the time of purchase
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        ''')
        # --- END NEW TABLES ---
        conn.commit()
        conn.close()
        print("Database schema initialized.")
    else:
        print("Could not connect to database for schema initialization.")

def add_sample_products():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]

        # Only add products if the table is empty
        if count == 0:
            print("Adding sample products...")
            products_to_add = [
                ("Laptop Pro X", "Electronics", 1200.00, "Powerful laptop for professionals with 16GB RAM and 512GB SSD."),
                ("Mechanical Keyboard", "Electronics", 85.50, "RGB Mechanical Keyboard with blue switches."),
                ("Wireless Mouse", "Electronics", 25.00, "Ergonomic wireless mouse with long battery life."),
                ("Python Programming Book", "Books", 45.99, "A comprehensive guide to Python programming for beginners."),
                ("Sci-Fi Novel Collection", "Books", 30.00, "Collection of 5 classic sci-fi novels."),
                ("Organic Cotton T-shirt", "Apparel", 22.00, "100% organic cotton t-shirt, available in multiple colors."),
                ("Denim Jeans Slim Fit", "Apparel", 65.00, "Comfortable slim fit denim jeans."),
                ("Smartwatch Series 5", "Electronics", 299.99, "Fitness tracker and smartwatch with heart rate monitoring."),
                ("Blender High Speed", "Home Appliances", 75.00, "Powerful blender for smoothies and shakes."),
                ("Running Shoes (Red)", "Apparel", 70.00, "Lightweight and breathable running shoes in vibrant red color."),
                ("Coffee Maker Deluxe", "Home Appliances", 120.00, "Programmable coffee maker with grinder for fresh beans."),
                ("Gaming Headset (Black)", "Electronics", 50.00, "Immersive sound gaming headset with mic.")
            ]

            # Generate additional mock products to reach 200 total
            categories = ["Electronics", "Books", "Apparel", "Home Appliances", "Sports & Outdoors", "Beauty"]
            adjectives = ["Advanced", "Smart", "Portable", "Durable", "Eco-friendly", "Classic", "Ergonomic", "High-Performance"]
            nouns = ["Gadget", "Tool", "Accessory", "Wearable", "Device", "System", "Kit", "Supply"]

            for i in range(1, 189): # Adding 188 more products to reach 200 total (12 existing + 188 new)
                name = f"{random.choice(adjectives)} {random.choice(nouns)} {i}"
                category = random.choice(categories)
                price = round(random.uniform(10.0, 1500.0), 2)
                description = f"A high-quality {category.lower()} item ({name.lower()}) with various features designed for modern living. Ideal for everyday use."
                products_to_add.append((name, category, price, description))

            cursor.executemany("INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)", products_to_add)
            conn.commit()
            print(f"Added {len(products_to_add)} sample products to meet the requirement of at least 100 products.")
        else:
            print(f"Products table already contains {count} items. Skipping sample data insertion. To repopulate, delete 'ecommerce.db' and restart the app.")
        conn.close()
    else:
        print("Could not connect to database to add sample products.")

# IMPORTANT: Ensure database and sample products are set up when the app starts
# This block runs when Gunicorn loads your app, ensuring the DB is ready.
with app.app_context():
    init_db()
    add_sample_products()

# --- Authentication Decorator ---
def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"message": "Authorization token is missing!"}), 401

        if id_token.startswith("Bearer "):
            id_token = id_token.split("Bearer ")[1]

        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token # Attach decoded user info to the request
        except Exception as e:
            print(f"Firebase Admin SDK Token verification failed: {e}")
            return jsonify({"message": "Invalid or expired token.", "error": str(e)}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- Routes ---

@app.route('/')
def home():
    return "Flask Backend is running!"

@app.route('/api/products', methods=['GET'])
@verify_token
def get_all_products():
    conn = get_db_connection()
    if conn:
        products_from_db = conn.execute('SELECT * FROM products').fetchall()
        conn.close()
        return jsonify([dict(row) for row in products_from_db])
    return jsonify({"message": "Database connection error"}), 500

@app.route('/api/chatbot', methods=['POST'])
@verify_token
def chatbot_query():
    user_id = request.user['uid']
    user_query = request.json.get('query', '').lower().strip()

    response_message = "I'm sorry, I couldn't find any products matching your query. Please try searching for something else or ask for 'all products'."
    products_for_response = [] # Initialize as empty, will be populated if products are found

    conn = get_db_connection()
    if not conn:
        return jsonify({"response": "Database connection error. Please try again later.", "products": []}), 500

    cursor = conn.cursor()

    # Define a set of common stop words to filter out (can be expanded)
    stop_words = set([
        "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "of", "at", "by", "for", "with", "from", "on",
        "in", "to", "up", "out", "down", "off", "over", "under", "again", "further", "then", "once",
        "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
        "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
        "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "what", "which",
        "who", "whom", "this", "that", "these", "those", "am", "i", "me", "my", "myself", "we",
        "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him",
        "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them",
        "their", "theirs", "themselves", "please", "can you", "i'm looking for", "i want", "do you have", "show me", "find me"
    ])

    # --- Handle Specific Commands / Intents ---
    if "all products" in user_query or "show all" in user_query or "view all" in user_query:
        found_products_db = cursor.execute("SELECT * FROM products").fetchall()
        products_for_response = [dict(row) for row in found_products_db] # Convert to dict list
        if products_for_response:
            response_message = f"Here are all {len(products_for_response)} products we have:"
        else:
            response_message = "I couldn't find any products in the database."
    elif "categories" in user_query or "product types" in user_query:
        unique_categories_db = cursor.execute("SELECT DISTINCT category FROM products").fetchall()
        unique_categories = sorted([row['category'] for row in unique_categories_db])
        if unique_categories:
            response_message = f"Our available product categories are: {', '.join(unique_categories)}."
        else:
            response_message = "I don't have any categories to display right now."
        products_for_response = [] # No products needed for a category list
    elif any(phrase in user_query for phrase in ["hello", "hi", "hey", "greetings"]):
        response_message = "Hello! How can I assist you today? You can ask me to search for products (e.g., 'search for laptop'), view categories, or ask for 'all products'."
        products_for_response = [] # No products needed for a greeting
    elif any(phrase in user_query for phrase in ["thank you", "thanks", "cheers", "appreciate it", "goodbye", "bye"]):
        response_message = "You're welcome! Is there anything else I can help you with? Or, goodbye!"
        products_for_response = [] # No products needed for a thank you/goodbye
    else:
        # --- Dynamic Product Search Logic for general queries ---
        # Remove stop words and tokenize the query
        cleaned_query = ' '.join([word for word in re.findall(r'\b\w+\b', user_query) if word not in stop_words])
        search_terms = []
        if cleaned_query:
            # Simple stemming: add plural/singular forms for basic keywords
            for term in cleaned_query.split():
                search_terms.append(term)
                if term.endswith('s') and len(term) > 3:
                    search_terms.append(term[:-1])
                elif term.endswith('e') and len(term) > 4: # e.g. 'mouse' -> 'mous' if you want a deeper stem
                    pass # Not adding anything specific here for now, as it's general
                # Add a very basic pluralization if it's a common singular form (e.g., 'laptop' -> 'laptops')
                if not term.endswith('s') and len(term) > 2:
                    search_terms.append(term + 's')

        search_terms = list(set(search_terms)) # Ensure unique terms

        if search_terms:
            query_parts = []
            query_params = []
            # Search in name, category, and description
            for keyword in search_terms:
                like_keyword = f"%{keyword}%"
                query_parts.append("(name LIKE ? OR category LIKE ? OR description LIKE ?)")
                query_params.extend([like_keyword, like_keyword, like_keyword])

            sql_query = f"SELECT * FROM products WHERE {' OR '.join(query_parts)}"
            found_products_db = cursor.execute(sql_query, query_params).fetchall()
            products_for_response = [dict(row) for row in found_products_db]

            if products_for_response:
                response_message = f"I found {len(products_for_response)} product(s) matching your search. "
                # Add a brief text summary of a few top products
                for product in products_for_response[:3]:
                    response_message += (
                        f"\n- {product['name']} ({product['category']}): ${product['price']:.2f}"
                    )
                if len(products_for_response) > 3:
                    response_message += f"\n...and {len(products_for_response) - 3} more. Please see the dashboard for full details."
                response_message += "\nIs there anything else I can help you find?"
            else:
                response_message = "I'm sorry, I couldn't find any products matching your specific query. Please try different keywords or ask for 'all products' to see everything."
        else:
            # If no meaningful search terms are extracted
            response_message = "I didn't quite understand your request. Can you please be more specific about the product you're looking for, or try keywords like 'laptop', 'book', 'electronics', or 'show all products'?"


    # Save to chat_history table
    try:
        cursor.execute(
            "INSERT INTO chat_history (user_id, timestamp, query, response) VALUES (?, ?, ?, ?)",
            (user_id, datetime.now().isoformat(), user_query, response_message) # Store timestamp and text response
        )
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error saving chat history: {e}")
    finally:
        conn.close()

    # Return both the text response and the structured products data
    return jsonify({
        "response": response_message,
        "products": products_for_response # Always return products_for_response, even if empty
    })

@app.route('/api/chat_history', methods=['GET'])
@verify_token
def get_chat_history():
    user_id = request.user['uid']
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection error."}), 500

    try:
        # Fetch chat history for the specific user, ordered by timestamp
        chat_logs = conn.execute(
            "SELECT timestamp, query, response FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC",
            (user_id,)
        ).fetchall()
        
        # Convert rows to a list of dictionaries
        history = [dict(row) for row in chat_logs]
        return jsonify(history)
    except sqlite3.Error as e:
        print(f"Error fetching chat history: {e}")
        return jsonify({"message": "Error fetching chat history.", "error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/checkout', methods=['POST'])
@verify_token
def checkout():
    user_id = request.user['uid']
    data = request.get_json()

    if not data or 'cartItems' not in data:
        return jsonify({"message": "Invalid request: 'cartItems' missing."}), 400

    cart_items = data['cartItems']
    if not cart_items:
        return jsonify({"message": "Cart is empty."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection error."}), 500

    try:
        cursor = conn.cursor()
        total_amount = 0
        products_for_order = []

        # Validate products and calculate total amount
        for item in cart_items:
            product_id = item.get('id')
            quantity = item.get('quantity')

            if not isinstance(product_id, (int, float)) or not isinstance(quantity, int) or quantity <= 0:
                conn.close()
                return jsonify({"message": f"Invalid product ID or quantity for item: {item}. Product IDs must be numeric (int/float) and quantity must be a positive integer."}), 400
            
            # Convert product_id to int in case it came as float (e.g. from JSON parsing)
            product_id = int(product_id)

            # Fetch product details from DB to ensure price is correct and product exists
            product_db = cursor.execute("SELECT id, name, price FROM products WHERE id = ?", (product_id,)).fetchone()
            if not product_db:
                conn.close()
                return jsonify({"message": f"Product with ID {product_id} not found in inventory."}), 404

            price_at_purchase = product_db['price']
            total_amount += price_at_purchase * quantity
            products_for_order.append({
                'product_id': product_id,
                'quantity': quantity,
                'price_at_purchase': price_at_purchase
            })

        # Insert into orders table
        order_date = datetime.now().isoformat()
        cursor.execute(
            "INSERT INTO orders (user_id, order_date, total_amount, status) VALUES (?, ?, ?, ?)",
            (user_id, order_date, total_amount, 'completed') # Assuming direct completion for this simple case
        )
        order_id = cursor.lastrowid # Get the ID of the newly created order

        # Insert into order_items table
        for item in products_for_order:
            cursor.execute(
                "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)",
                (order_id, item['product_id'], item['quantity'], item['price_at_purchase'])
            )

        conn.commit()
        conn.close()
        return jsonify({"message": "Order placed successfully!", "order_id": order_id, "total_amount": round(total_amount, 2)}), 201

    except sqlite3.Error as e:
        conn.rollback() # Rollback in case of an error during transaction
        print(f"Database error during checkout: {e}")
        return jsonify({"message": "Database error during checkout.", "error": str(e)}), 500
    except Exception as e:
        print(f"Server error during checkout: {e}")
        return jsonify({"message": "An unexpected error occurred.", "error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# --- Run the App ---
if __name__ == '__main__':
    # This block is for local development when you run 'python app.py' directly.
    # It will not be executed when Gunicorn runs your app on Render.
    # The init_db() and add_sample_products() at the top-level are for Gunicorn.
    with app.app_context():
        init_db()
        add_sample_products()

    # UPDATED: Set debug=False for production readiness (even if this block isn't used by Gunicorn)
    app.run(debug=False, host='0.0.0.0', port=5000)