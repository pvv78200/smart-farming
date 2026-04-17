from django.urls import path
from .views import (
    delete_product, login_user, register_user,
    send_otp, update_stock, verify_otp,
    add_category, add_product, market_data, save_profile, get_profile, all_products, add_to_cart, get_cart, remove_from_cart, checkout, get_orders, verify_payment, create_payment, save_address, get_address, cod_order, cod_checkout, update_order_status
)

urlpatterns = [
    path('send-otp/', send_otp),
    path('verify-otp/', verify_otp),
    path("save-profile/", save_profile),
    path("get-profile/", get_profile),

    path('register/', register_user),
    path('login/', login_user),
    path('add-category/', add_category),
    path('add-product/', add_product),
    path('market-data/', market_data),
    path('delete-product/', delete_product),
    path('update-stock/', update_stock),
    path("all-products/", all_products),
    path("add-to-cart/", add_to_cart),
    path("get-cart/", get_cart),
    path("remove-from-cart/", remove_from_cart),
    path("checkout/", checkout),
    path("orders/", get_orders),
    path("create-payment/", create_payment),
    path("verify-payment/", verify_payment),
    path("save-address/", save_address),
    path("get-address/", get_address),
    path("cod-order/", cod_order),
    path("cod-checkout/", cod_checkout),
    path("update-order-status/", update_order_status),
]