import json
import os
import random
import requests
import bcrypt
from bson import ObjectId

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# ✅ MongoDB
from .mongodb import db, user_collection, category_collection, product_collection, cart_collection, order_collection, customer_collection 

# 🔥 NEW COLLECTION
customer_collection = db["customers"]

# ============================
# ✅ USER AUTH (FARMER)
# ============================

@csrf_exempt
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        name = data.get("name")
        mobile = data.get("mobile")
        password = data.get("password")
        location = data.get("location")

        if not name or not mobile or not password or not location:
            return JsonResponse({"status": "error", "message": "All fields required"}, status=400)

        if user_collection.find_one({"mobile": mobile}):
            return JsonResponse({"status": "error", "message": "Mobile exists"}, status=400)

        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

        user_collection.insert_one({
            "name": name,
            "mobile": mobile,
            "password": hashed_password.decode(),
            "location": location
        })

        return JsonResponse({"status": "success", "message": "Registered"})


@csrf_exempt
def login_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        mobile = data.get("mobile")
        password = data.get("password")

        user = user_collection.find_one({"mobile": mobile})

        if not user:
            return JsonResponse({"message": "User not found"}, status=404)

        if bcrypt.checkpw(password.encode(), user["password"].encode()):
            return JsonResponse({
                "message": "Login success",
                "user": {
                    "name": user["name"],
                    "mobile": user["mobile"],
                    "location": user["location"]
                }
            })
        else:
            return JsonResponse({"message": "Wrong password"}, status=401)


# ============================
# ✅ CATEGORY
# ============================

@csrf_exempt
def add_category(request):
    if request.method == "POST":
        data = json.loads(request.body)

        name = data.get("name")
        user_mobile = data.get("user_mobile")

        if category_collection.find_one({"name": name, "user_mobile": user_mobile}):
            return JsonResponse({"message": "Category exists"}, status=400)

        category_collection.insert_one({
            "name": name,
            "user_mobile": user_mobile
        })

        return JsonResponse({"message": "Category added"})


# ============================
# ✅ PRODUCT ADD / UPDATE
# ============================

@csrf_exempt
def add_product(request):
    if request.method == "POST":
        try:
            name = request.POST.get("name", "").strip()
            price = request.POST.get("price")
            stock = request.POST.get("stock")
            category = request.POST.get("category")
            description = request.POST.get("description", "").strip()
            user_mobile = request.POST.get("user_mobile")
            product_id = request.POST.get("id")

            image = request.FILES.get("image")

            # 🔴 VALIDATION
            if not name or not price or not stock or not category or not description:
                return JsonResponse({"message": "All fields required"}, status=400)

            price = int(price)
            stock = int(stock)

            if price <= 0 or stock < 0:
                return JsonResponse({"message": "Invalid values"}, status=400)

            update_data = {
                "name": name,
                "price": price,
                "stock": stock,
                "category": category,
                "description": description,
                "user_mobile": user_mobile
            }

            # 🖼️ IMAGE SAVE
            if image:
                if not os.path.exists(settings.MEDIA_ROOT):
                    os.makedirs(settings.MEDIA_ROOT)

                file_path = os.path.join(settings.MEDIA_ROOT, image.name)

                with open(file_path, "wb+") as f:
                    for chunk in image.chunks():
                        f.write(chunk)

                update_data["image"] = image.name

            # 🔥 UPDATE
            if product_id:
                product_collection.update_one(
                    {"_id": ObjectId(product_id)},
                    {"$set": update_data}
                )
                return JsonResponse({"message": "Product updated"})

            # 🔴 DUPLICATE CHECK
            if product_collection.find_one({"name": name, "user_mobile": user_mobile}):
                return JsonResponse({"message": "Product exists"}, status=400)

            product_collection.insert_one(update_data)

            return JsonResponse({"message": "Product added"})

        except Exception as e:
            print("ERROR:", e)
            return JsonResponse({"message": "Server error"}, status=500)


# ============================
# ✅ GET MARKET DATA (FARMER)
# ============================

def market_data(request):
    mobile = request.GET.get("mobile")

    categories = list(category_collection.find({"user_mobile": mobile}))
    products = list(product_collection.find({"user_mobile": mobile}))

    for c in categories:
        c["_id"] = str(c["_id"])

    for p in products:
        p["_id"] = str(p["_id"])

    return JsonResponse({
        "categories": [c["name"] for c in categories],
        "products": products
    })


# ============================
# ✅ ALL PRODUCTS (CUSTOMER)
# ============================

def all_products(request):
    products = list(product_collection.find())

    for p in products:
        p["_id"] = str(p["_id"])

    return JsonResponse({"products": products})


# ============================
# ✅ DELETE PRODUCT
# ============================

@csrf_exempt
def delete_product(request):
    if request.method == "POST":
        data = json.loads(request.body)

        name = data.get("name")
        user_mobile = data.get("user_mobile")

        product_collection.delete_one({
            "name": name,
            "user_mobile": user_mobile
        })

        return JsonResponse({"message": "Deleted"})


# ============================
# ✅ UPDATE STOCK
# ============================

@csrf_exempt
def update_stock(request):
    if request.method == "POST":
        data = json.loads(request.body)

        product_id = data.get("id")
        stock = int(data.get("stock"))

        product_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"stock": stock}}
        )

        return JsonResponse({"message": "Stock updated"})


# ============================
# ✅ OTP LOGIN (CUSTOMER)
# ============================

otp_store = {}

@csrf_exempt
def send_otp(request):
    if request.method != "POST":
        return JsonResponse({"message": "Only POST allowed"}, status=405)

    data = json.loads(request.body)
    mobile = data.get("mobile")

    otp = str(random.randint(1000, 9999))
    otp_store[mobile] = otp

    print("OTP:", otp)  # backup

    url = "https://www.fast2sms.com/dev/bulkV2"

    payload = {
        "variables_values": otp,
        "route": "otp",
        "numbers": mobile
    }

    headers = {
        "authorization": "YOUR_API_KEY",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        requests.post(url, data=payload, headers=headers)
    except:
        pass

    return JsonResponse({"message": "OTP sent"})


@csrf_exempt
def verify_otp(request):
    data = json.loads(request.body)

    mobile = data.get("mobile")
    otp = data.get("otp")

    if otp_store.get(mobile) == otp:
        return JsonResponse({"message": "Login successful"})
    else:
        return JsonResponse({"message": "Invalid OTP"}, status=400)


# ============================
# ✅ CUSTOMER PROFILE
# ============================

@csrf_exempt
def save_profile(request):
    if request.method == "POST":
        data = json.loads(request.body)

        mobile = data.get("mobile")

        if not mobile:
            return JsonResponse({"message": "Mobile missing"}, status=400)

        customer_collection.update_one(
            {"mobile": mobile},
            {
                "$set": {
                    "name": data.get("name", ""),
                    "email": data.get("email", ""),
                    "address": data.get("address", ""),
                    "mobile": mobile
                }
            },
            upsert=True
        )

        return JsonResponse({"message": "Profile saved"})


def get_profile(request):
    mobile = request.GET.get("mobile")

    user = customer_collection.find_one(
        {"mobile": mobile},
        {"_id": 0}
    )

    return JsonResponse({"profile": user or {}})



@csrf_exempt
def add_to_cart(request):
    data = json.loads(request.body)

    mobile = data.get("mobile")
    product = data.get("product")

    product_id = product.get("_id")
    farmer = product.get("user_mobile")   # 🔥 farmer info

    existing = cart_collection.find_one({"mobile": mobile})

    if existing:
        existing_farmer = existing.get("farmer")

        # ❗ DIFFERENT FARMER → CLEAR CART
        if existing_farmer != farmer:
            cart_collection.delete_one({"mobile": mobile})

            cart_collection.insert_one({
                "mobile": mobile,
                "farmer": farmer,
                "products": [{
                    "product_id": product_id,
                    "name": product["name"],
                    "price": product["price"],
                    "image": product.get("image"),
                    "quantity": 1,
                    "farmer_mobile": farmer 
                }]
            })

            return JsonResponse({
                "message": "Cart reset! Only one farmer allowed"
            })

        # ✅ SAME FARMER → NORMAL ADD
        found = False
        for p in existing["products"]:
            if p["product_id"] == product_id:
                cart_collection.update_one(
                    {"mobile": mobile, "products.product_id": product_id},
                    {"$inc": {"products.$.quantity": 1}}
                )
                found = True
                break

        if not found:
            cart_collection.update_one(
                {"mobile": mobile},
                {
                    "$push": {
                        "products": {
                            "product_id": product_id,
                            "name": product["name"],
                            "price": product["price"],
                            "image": product.get("image"),
                            "quantity": 1,
                            "farmer_mobile": farmer 
                        }
                    }
                }
            )

    else:
        # 🆕 NEW CART
        cart_collection.insert_one({
            "mobile": mobile,
            "farmer": farmer,
            "products": [{
                "product_id": product_id,
                "name": product["name"],
                "price": product["price"],
                "image": product.get("image"),
                "quantity": 1
            }]
        })

    return JsonResponse({"message": "Added to cart"})




def get_cart(request):
    mobile = request.GET.get("mobile")

    cart = cart_collection.find_one({"mobile": mobile}, {"_id": 0})

    return JsonResponse({"cart": cart or {"products": []}})



@csrf_exempt
def remove_from_cart(request):
    data = json.loads(request.body)

    mobile = data.get("mobile")
    product_id = data.get("product_id")

    cart_collection.update_one(
        {"mobile": mobile},
        {"$pull": {"products": {"product_id": product_id}}}
    )

    return JsonResponse({"message": "Removed"})



@csrf_exempt
def checkout(request):
    if request.method == "POST":
        data = json.loads(request.body)

        mobile = data.get("mobile")

        if not mobile:
            return JsonResponse({"message": "Mobile required"}, status=400)

        cart = cart_collection.find_one({"mobile": mobile})

        if not cart or not cart.get("products"):
            return JsonResponse({"message": "Cart empty"}, status=400)

        products = cart["products"]

        total = sum(int(p["price"]) * int(p["quantity"]) for p in products)

        # ✅ SAVE ORDER
        order_collection.insert_one({
            "mobile": mobile,
            "products": products,
            "total": total,
            "status": "Pending",
            "farmer_mobile": cart["products"][0].get("farmer_mobile")
        })

        # 🧹 CLEAR CART
        cart_collection.delete_one({"mobile": mobile})

        return JsonResponse({
            "message": "Order placed successfully",
            "total": total
        })
    

def get_orders(request):
    mobile = request.GET.get("mobile")

    orders = list(order_collection.find({"mobile": mobile}))

    for o in orders:
        o["_id"] = str(o["_id"])

    return JsonResponse({"orders": orders})

import razorpay
from django.views.decorators.csrf import csrf_exempt

client = razorpay.Client(auth=("rzp_test_SeEsBzgMu6OWWn", "w0OzT7YZNAkyA3WKrwtg2Zjs"))


@csrf_exempt
def create_payment(request):
    data = json.loads(request.body)

    mobile = data.get("mobile")

    cart = cart_collection.find_one({"mobile": mobile})

    if not cart:
        return JsonResponse({"message": "Cart empty"}, status=400)

    total = sum(int(p["price"]) for p in cart["products"])

    amount = total * 100  # Razorpay uses paise

    payment = client.order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1
    })

    return JsonResponse({
        "order_id": payment["id"],
        "amount": amount
    })


from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import datetime
import random

@csrf_exempt
def verify_payment(request):
    data = json.loads(request.body)
    mobile = data.get("mobile")

    cart = cart_collection.find_one({"mobile": mobile})

    if not cart:
        return JsonResponse({"message": "Cart empty"}, status=400)

    products = cart["products"]
    total = sum(int(p["price"]) * int(p["quantity"]) for p in products)

    # 🔥 Generate token
    token = random.randint(100000, 999999)

    address = delivery_collection.find_one({"mobile": mobile})

    # ✅ Save order
    order_collection.insert_one({
        "mobile": mobile,
        "products": products,
        "total": total,
        "token": token,
        "status": "Pending",
        "farmer_mobile": cart.get("farmer")
    })

    # 🧹 Clear cart
    cart_collection.delete_one({"mobile": mobile})

    # 📄 Generate PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="invoice.pdf"'

    doc = SimpleDocTemplate(response)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Smart Farming Market - Invoice", styles['Title']))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"Date: {datetime.datetime.now()}", styles['Normal']))
    elements.append(Paragraph(f"Token Number: {token}", styles['Normal']))
    elements.append(Spacer(1, 10))

    if address:
        elements.append(Paragraph("Delivery Address:", styles['Heading3']))
        elements.append(Paragraph(f"{address.get('name')}", styles['Normal']))
        elements.append(Paragraph(f"{address.get('address')}", styles['Normal']))
        elements.append(Paragraph(f"{address.get('town')} - {address.get('pincode')}", styles['Normal']))
        elements.append(Paragraph(f"{address.get('district')}", styles['Normal']))
        elements.append(Spacer(1, 10))

    elements.append(Paragraph("Products:", styles['Heading3']))

    for p in products:
        elements.append(Paragraph(
            f"{p['name']} | Qty: {p['quantity']} | ₹{p['price']} | Subtotal: ₹{p['price'] * p['quantity']}",
            styles['Normal']
        ))

    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Total Amount: ₹{total}", styles['Heading2']))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(
        "Note: Show token number to delivery agent.",
        styles['Italic']
    ))

    doc.build(elements)

    return response


# ============================
# DELIVERY ADDRESS
# ============================

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

delivery_collection = db["delivery_address"]


@csrf_exempt
def save_address(request):
    data = json.loads(request.body)

    mobile = data.get("mobile")

    if not mobile:
        return JsonResponse({"message": "Mobile required"}, status=400)

    delivery_collection.update_one(
        {"mobile": mobile},
        {
            "$set": {
                "name": data.get("name"),
                "mobile": mobile,
                "address": data.get("address"),
                "pincode": data.get("pincode"),
                "town": data.get("town"),
                "district": data.get("district")
            }
        },
        upsert=True
    )

    return JsonResponse({"message": "Address saved"})


def get_address(request):
    mobile = request.GET.get("mobile")

    if not mobile:
        return JsonResponse({"address": {}}, status=400)

    data = delivery_collection.find_one(
        {"mobile": mobile},
        {"_id": 0}
    )

    return JsonResponse({"address": data or {}})



import requests
import random

def generate_token():
    return str(random.randint(100000, 999999))


@csrf_exempt
def cod_order(request):
    data = json.loads(request.body)
    mobile = data.get("mobile")

    cart = cart_collection.find_one({"mobile": mobile})

    if not cart:
        return JsonResponse({"message": "Cart empty"}, status=400)

    products = cart["products"]

    token = generate_token()

    total = sum(p["price"] * p["quantity"] for p in products)

    # ✅ SAVE ORDER
    order_collection.insert_one({
        "mobile": mobile,
        "products": products,
        "total": total,
        "token": token,
        "payment": "COD",
        "status": "Placed"
    })

    # 🧹 CLEAR CART
    cart_collection.delete_one({"mobile": mobile})

    # ================= SMS MESSAGE =================
    message = f"Order Confirmed!\nToken: {token}\n\n"

    for p in products:
        message += f"{p['name']} x{p['quantity']} = ₹{p['price'] * p['quantity']}\n"

    message += f"\nTotal: ₹{total}"

    # ================= SEND SMS =================
    url = "https://www.fast2sms.com/dev/bulkV2"

    payload = {
        "sender_id": "FSTSMS",
        "message": message,
        "language": "english",
        "route": "q",
        "numbers": mobile
    }

    headers = {
        "authorization": "YOUR_API_KEY",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        response = requests.post(url, data=payload, headers=headers)
        print("SMS Response:", response.text)
    except Exception as e:
        print("SMS Error:", e)

    return JsonResponse({
        "message": "Order placed",
        "token": token
    })



from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from django.http import HttpResponse
import datetime
import random

@csrf_exempt
def cod_checkout(request):
    data = json.loads(request.body)
    mobile = data.get("mobile")

    cart = cart_collection.find_one({"mobile": mobile})

    if not cart or not cart.get("products"):
        return JsonResponse({"message": "Cart empty"}, status=400)

    products = cart["products"]

    total = sum(int(p["price"]) * int(p["quantity"]) for p in products)

    # 🔥 Generate token
    token = random.randint(100000, 999999)

    # 🔥 Get address
    address = delivery_collection.find_one({"mobile": mobile})

    # 🔥 Save order
    order_collection.insert_one({
        "mobile": mobile,
        "products": products,
        "total": total,
        "token": token,
        "status": "COD"
    })

    # 🧹 Clear cart
    cart_collection.delete_one({"mobile": mobile})

    # 📄 Create PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="invoice.pdf"'

    doc = SimpleDocTemplate(response)
    styles = getSampleStyleSheet()

    elements = []

    elements.append(Paragraph("Smart Farming Market - Invoice", styles['Title']))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"Date: {datetime.datetime.now()}", styles['Normal']))
    elements.append(Paragraph(f"Token Number: {token}", styles['Normal']))
    elements.append(Spacer(1, 10))

    # Address
    if address:
        elements.append(Paragraph("Delivery Address:", styles['Heading3']))
        elements.append(Paragraph(f"{address.get('name')}", styles['Normal']))
        elements.append(Paragraph(f"{address.get('address')}", styles['Normal']))
        elements.append(Paragraph(f"{address.get('town')} - {address.get('pincode')}", styles['Normal']))
        elements.append(Paragraph(f"{address.get('district')}", styles['Normal']))
        elements.append(Spacer(1, 10))

    # Products
    elements.append(Paragraph("Products:", styles['Heading3']))

    for p in products:
        elements.append(Paragraph(
            f"{p['name']} | Qty: {p['quantity']} | ₹{p['price']} | Subtotal: ₹{p['price'] * p['quantity']}",
            styles['Normal']
        ))

    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Total Amount: ₹{total}", styles['Heading2']))

    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "Note: Show this token number to delivery agent.",
        styles['Italic']
    ))

    doc.build(elements)

    return response



from bson import ObjectId
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def update_order_status(request):
    try:
        data = json.loads(request.body)

        order_id = data.get("order_id")
        status = data.get("status")

        if not order_id or not status:
            return JsonResponse({"message": "Invalid data"}, status=400)

        # ✅ VALID STATUS CHECK (VERY IMPORTANT)
        valid_status = ["Pending", "Approved", "In Delivery", "Delivered", "Rejected"]

        if status not in valid_status:
            return JsonResponse({"message": "Invalid status"}, status=400)

        result = order_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": status}}
        )

        if result.matched_count == 0:
            return JsonResponse({"message": "Order not found"}, status=404)

        return JsonResponse({"message": "Status updated successfully"})

    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)


from bson import ObjectId

@csrf_exempt
def farmer_orders(request):
    farmer_mobile = request.GET.get("mobile")

    orders = list(order_collection.find(
        {"farmer_mobile": farmer_mobile}
    ))

    for o in orders:
        o["_id"] = str(o["_id"])  # ✅ convert ObjectId

    return JsonResponse({"orders": orders})