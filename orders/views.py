from datetime import datetime
from decimal import Decimal
from sqlite3 import IntegrityError
from django.db.models import Sum
import json
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from orders.templates import *
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from .models import (
    Category_Food,
    Food,
    Size_Food,
    Food_Toppings,
    Orders,
    Order_Details,
    Cart,
)
from django.db.models import F
from django.contrib import messages


# Create your views here.
def index(request):
    user = request.user.username
    user_id = request.user.id
    ct_fod = Category_Food.objects.all()
    cant = 0
    is_admin = request.user.is_superuser
    if not user:
        return redirect("login")
    else:
        cant = Cart.objects.filter(user_id=user_id).count()
        order = (
            Orders.objects.filter(user_id=user_id)
            .distinct()
            .values("user_id", "order_date", "status", "direccion_de_entrega")
        )

        # Filtrar pedidos para el usuario actual o administradores
        if is_admin:
            # Si el usuario es un administrador, muestra todos los pedidos
            orders_with_details = (
                Orders.objects.all()
                .select_related("user")
                .prefetch_related("order_details_set")
                .all()
            )
        else:
            # Si el usuario no es un administrador, muestra solo sus propios pedidos
            orders_with_details = (
                Orders.objects.filter(Q(user_id=user_id))
                .select_related("user")
                .prefetch_related("order_details_set")
                .all()
            )
        return render(
            request,
            "index.html",
            {
                "Category": ct_fod,
                "username": user,
                "user_id": user_id,
                "cant": cant,
                "orders_with_details": orders_with_details,
                "isadmin": is_admin,
            },
        )


def select_category(request, id):
    ct_fod = Category_Food.objects.all()
    queryset = (
        Food.objects.select_related("size_food", "category_food")
        .values(
            "id",
            "name_food",
            "description",
            "image_food",
            "size_food__name_size",
            small_price=F("size_food__price_food_small"),
            large_price=F("size_food__price_food_large"),
            category_name=F("category_food__name_category"),
            category_id=F("category_food__id"),
        )
        .order_by("category_food__id")
        .filter(category_food__id=id)
    )
    # Convierte el queryset en una lista de diccionarios
    Food_Inf = list(queryset)

    # Devuelve la lista como una respuesta JSON
    return JsonResponse(Food_Inf, safe=False)


def orders(request, food_id, category_id):
    try:
        detalles_comida = Size_Food.objects.get(food_id=food_id)
        food_toppings = (
            Food_Toppings.objects.filter(category_food_id=category_id)
            .select_related("toppings")
            .values(
                "toppings__name_toppings", "toppings_id", "toppings__price_toppings"
            )
        )
    except Size_Food.DoesNotExist:
        response_data = {"message": "Producto no encontrado"}
    else:
        name_food = detalles_comida.food.name_food
        image_food = detalles_comida.food.image_food
        small_price = detalles_comida.price_food_small
        large_price = detalles_comida.price_food_large

        toppings_list = [
            {
                "toppings_id": topping["toppings_id"],
                "name": topping["toppings__name_toppings"],
                "price_toppings": topping["toppings__price_toppings"],
            }
            for topping in food_toppings
        ]

        response_data = {
            "name_food": name_food,
            "image_food": str(image_food),
            "small_price": small_price,
            "large_price": large_price,
            "toppings": toppings_list,
        }

    return JsonResponse(response_data)


def login_views(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return render(
                request, "index.html", {"message": f"Welcome User {user.username}"}
            )
        else:
            return render(
                request,
                "registration/login.html",
                {"message": "User or Password Invalid"},
            )

    return render(request, "registration/login.html")


def register_views(request):
    if request.method == "POST":
        firstname = request.POST.get("firstname")
        lastname = request.POST.get("lastname")
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirmpassword = request.POST.get("confirmpassword")

        if not all([firstname, lastname, username, email, password, confirmpassword]):
            return render(
                request,
                "registration/register.html",
                {"message": "Complete todos los campos."},
            )

        if password != confirmpassword:
            return render(
                request,
                "registration/register.html",
                {"message": "Las contraseñas no coinciden."},
            )

        try:
            user = User.objects.create_user(
                username=username, email=email, password=password
            )
            user.first_name = firstname
            user.last_name = lastname
            user.save()
            messages.success(request, f"Usuario {user.first_name} creado exitosamente.")
            authenticated_user = authenticate(username=username, password=password)
            login(request, authenticated_user)
            return redirect("/")  # Redirigir a la página de inicio
        except IntegrityError as e:
            return render(
                request,
                "registration/register.html",
                {
                    "message": "No se pudo crear el usuario. El nombre de usuario o correo electrónico ya existe."
                },
            )
        except Exception as e:
            return render(
                request,
                "registration/register.html",
                {"message": f"No se pudo crear el usuario. Error: {e}"},
            )

    return render(request, "registration/register.html", {"form": UserCreationForm})


def logout_views(request):
    logout(request)
    messages.success(request, "Logged out")
    return render(request, "registration/login.html")


def cart(request):
    if request.method == "POST":
        data = json.loads(request.body)
        # Accediendo a las propiedades del objeto JSON
        usuario_id = int(data.get("usuario"))
        producto_id = int(data.get("producto"))
        cantidad = int(data.get("cantidad"))
        precio = Decimal(data.get("precio"))
        toppings = data.get("toppings")
        total = Decimal(data.get("total"))
        # Convertir la lista de toppings en una cadena separada por comas
        list_toppings = ",".join(toppings)
        # Obtener instancias de User y Food (producto) usando los IDs
        try:
            #!Aunque envie el Id se debe instanciar
            usuario = User.objects.get(id=usuario_id)
            producto = Food.objects.get(id=producto_id)
        except (User.DoesNotExist, Food.DoesNotExist):
            response_data = {"error": "Usuario o producto no encontrado"}
            return JsonResponse(response_data, status=400)

        #!Crear un nuevo objeto Cart usando el método create del administrador del modelo Cart
        #!Se debe de crear con las mismas columnas que lleva la bd
        item_cart = Cart.objects.create(
            list_toppings=list_toppings,
            unitari_price=precio,
            quantity=cantidad,
            total_price=total,
            user=usuario,
            food=producto,
        )

        print("Producto Agregado a Carrito :D")
        response_data = {"message": "Producto agregado correctamente"}
        return JsonResponse(response_data)
    else:
        response_data = {"error": "Método de solicitud no permitido."}
        return JsonResponse(response_data, status=405)


def get_cart(request):
    user_id = request.user.id

    cant = Cart.objects.filter(user_id=user_id).count()
    try:
        cart_data = (
            Cart.objects.filter(user_id=user_id)
            .select_related("food")
            .values(
                "id",
                "food__name_food",
                "list_toppings",
                "quantity",
                "total_price",
                image_food=F("food__image_food"),
            )
        )
        cart_list = list(cart_data)
        print(cart_list)
        response_data = {"cart": cart_list, "cant": cant}

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def delete_cart(request, id):
    try:
        item = Cart.objects.get(id=id)
        item.delete()
        response_data = {"message": "Producto Eliminado de Carrito"}
        return JsonResponse(response_data, status=200)
    except Cart.DoesNotExist:
        response_data = {"message": "Producto no encontrado en el carrito"}
        return JsonResponse(response_data, status=404)


def orders_register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        usuario_id = int(data.get("user_id"))
        direccion_de_entrega = data.get("direccion")
        usuario = User.objects.get(id=usuario_id)
        date = datetime.now()

        orden_existente = Orders.objects.filter(order_date=date, user=usuario).first()

        if orden_existente:
            orden_id = orden_existente.id
            response_data = {"id": orden_id}
            return JsonResponse(response_data)
        else:
            nueva_orden = Orders.objects.create(
                order_date=date,
                status="pending",
                user=usuario,
                direccion_de_entrega=direccion_de_entrega,
            )
            orden_id = nueva_orden.id
            response_data = {"id": orden_id}
            return JsonResponse(response_data)
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)


def order_details(request, id_order):
    user_id = request.user.id
    user = request.user.username
    order = get_object_or_404(Orders, id=id_order, user_id=user_id)
    dire = order.direccion_de_entrega
    cart_items = (
        Cart.objects.filter(user_id=user_id)
        .select_related("food")
        .values(
            "food__name_food",
            "list_toppings",
            "quantity",
            "total_price",
            "food__id",
            image_food=F("food__image_food"),
        )
    )

    total_price = Cart.objects.filter(user_id=user_id).aggregate(
        total_quantity=Sum("total_price")
    )["total_quantity"]

    if request.method == "POST":
        for item in cart_items:
            order_details = Order_Details.objects.create(
                orders=order,
                list_toppings=item["list_toppings"],
                quantity=item["quantity"],
                total=item["total_price"],
                food_id=item["food__id"],
            )
            order_details.save()

        # Limpiar el carrito después de agregar los detalles del pedido
        Cart.objects.filter(user_id=user_id).delete()

        return render(
            request,
            "orderss.html",
            {"message": "Order details created successfully"},
            status=201,
        )
    else:
        return render(
            request,
            "orderss.html",
            {
                "cart_items": cart_items,
                "date": datetime.now(),
                "username": user,
                "dire": dire,
                "total": round(total_price, 2),
            },
        )


def orders_completed(request, id):
    user_id = request.user.id
    print(id)
    # Intenta obtener la orden pendiente del usuario actual
    active = get_object_or_404(Orders, id=id, status="pending")
    print(active)
    if not active:
        return JsonResponse({"message": "No se encontró la orden pendiente."})

    # Actualiza el estado de la orden a "completed"
    active.status = "completed"
    active.save()

    return JsonResponse({"message": "La Orden Fue Marcada Como Completada"})


def viewcompletedxd(request):
    user_id = request.user.id
    if request.method == "GET":
        orders = (
            Orders.objects.filter().values()
        )  # Convierte el QuerySet a una lista de diccionarios
        orders_list = list(orders)  # Convierte la queryset a una lista de diccionarios
        return JsonResponse(
            {"active": orders_list, "message": "No se encontró la orden pendiente."}
        )
