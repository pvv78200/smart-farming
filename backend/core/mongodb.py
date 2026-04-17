from pymongo import MongoClient

client = MongoClient("mongodb+srv://admin:admin123@cluster0.rfo27rz.mongodb.net/?appName=Cluster0")

db = client["smart_farming_db"]

user_collection = db["users"]
category_collection = db["categories"]
product_collection = db["products"]
customer_collection = db["customers"]
cart_collection = db["cart"]
order_collection = db["orders"]
address_collection = db["address"]