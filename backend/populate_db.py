# backend/populate_db.py
import sqlite3
import random
from faker import Faker # We'll need to install this library

DATABASE = 'ecommerce.db'
NUM_PRODUCTS = 120 # Aim for at least 100

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def populate_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    fake = Faker()

    # Categories for our products
    categories = ['Electronics', 'Books', 'Textiles', 'Home Goods', 'Sports & Outdoors', 'Beauty', 'Toys']

    print(f"Populating database with {NUM_PRODUCTS} products...")
    for i in range(NUM_PRODUCTS):
        name = fake.sentence(nb_words=3).replace('.', '') # e.g., "Smart Wireless Headphone"
        category = random.choice(categories)
        price = round(random.uniform(10.00, 1000.00), 2)
        description = fake.paragraph(nb_sentences=2)

        cursor.execute(
            "INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)",
            (name, category, price, description)
        )
    conn.commit()
    conn.close()
    print("Database population complete!")

if __name__ == '__main__':
    # Ensure the products table exists (if app.py wasn't run yet)
    # Note: app.py already calls init_db() which creates tables.
    # This is just a safeguard if you run this script independently first.
    conn = get_db_connection()
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
    conn.commit()
    conn.close()

    populate_products()