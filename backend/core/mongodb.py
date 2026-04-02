from pymongo import MongoClient

client = MongoClient("mongodb+srv://admin:admin123@cluster0.rfo27rz.mongodb.net/?appName=Cluster0")

db = client["smart_farming_db"]

user_collection = db["users"]