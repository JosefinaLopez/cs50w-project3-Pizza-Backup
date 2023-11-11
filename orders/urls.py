from django.urls import path, include
from django.contrib import admin
from . import views

urlpatterns = [
    path("login/", views.login_views, name="login"),
    path("", views.index, name="index"),
    path("menu/order/<int:food_id>/<int:category_id>", views.orders, name="order"),
    path("category/food/<int:id>", views.select_category, name="category"),
    path("cartxd/", views.cart, name="cart"),
    path("cart/views/",views.get_cart, name="cartview"),
    path("cart/delete/<int:id>/", views.delete_cart, name="deletecart"),
    path("orders/", views.orders_register,name="registerorders"),
    path("completed/<int:id>/",views.orders_completed,name="completedorders"),
    path("viewscompleted/", views.viewcompletedxd,name="xD"),
    path("orders_details/<int:id_order>/", views.order_details,name="registerordersdeta"),
    path("register/", views.register_views, name="register"),
    path("logout/", views.logout_views, name="logout"),
]
