from .mongodb import user_collection
import json
import bcrypt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        name = data.get("name")
        mobile = data.get("mobile")
        password = data.get("password") 
        location = data.get("location")

        # 🔴 VALIDATION
        if not name or not mobile or not password or not location:
            return JsonResponse({
                "status": "error",
                "message": "All fields are required"
            }, status=400)

        # 🔴 DUPLICATE CHECK
        if user_collection.find_one({"mobile": mobile}):
            return JsonResponse({
                "status": "error",
                "message": "Mobile number already exists"
            }, status=400)

        # 🔐 HASH PASSWORD
        import bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # ✅ INSERT
        user_collection.insert_one({
            "name": name,
            "mobile": mobile,
            "password": hashed_password.decode('utf-8'),
            "location": location
        })

        return JsonResponse({
            "status": "success",
            "message": "Registered successfully"
        })


@csrf_exempt
def login_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        mobile = data.get("mobile")
        password = data.get("password")

        # 🔴 VALIDATION
        if not mobile or not password:
            return JsonResponse({
                "status": "error",
                "message": "All fields are required"
            }, status=400)

        # 🔍 FIND USER
        user = user_collection.find_one({"mobile": mobile})

        # ❌ USER NOT FOUND
        if not user:
            return JsonResponse({
                "status": "error",
                "message": "User not registered"
            }, status=404)

        import bcrypt

        # 🔐 CHECK PASSWORD
        if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            return JsonResponse({
                "status": "success",
                "message": "Login successful",
                "user": {
                    "name": user["name"],
                    "mobile": user["mobile"],
                    "location": user["location"]
                }
            })
        else:
            return JsonResponse({
                "status": "error",
                "message": "Invalid password"
            }, status=401)



