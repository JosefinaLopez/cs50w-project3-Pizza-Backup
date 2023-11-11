from django.db import models
from django.contrib.auth.models import User


#! migraciones

STATUS = (
    ("pending", "Pending"),
    ("accepted", "Accepted"),
    ("rejected", "Rejected"),
    ("delivered", "Delivered"),
)

CATEGORY_FOOD = (
    ("salad", "Salad"),
    ("subs", "Subs"),
    ("dinner", "Dinner"),
    ("pizza", "Pizza"),
    ("pasta", "Pasta"),
    ("drinks", "Drinks"),
)

SIZES = (
    ("small & large", "Small & Large"),
    ("small", "Small"),
    ("large", "Large"),
    ("normal", "Normal"),
)


class Category_Food(models.Model):
    name_category = models.CharField(max_length=255, choices=CATEGORY_FOOD)

    def __str__(self):
        return self.name_category


class Food(models.Model):
    name_food = models.CharField(max_length=255)
    description = models.TextField()
    image_food = models.ImageField(upload_to="orders/static/img/food/", default="")
    category_food = models.ForeignKey(Category_Food, on_delete=models.CASCADE)

    def __str__(self):
        return self.name_food


class Size_Food(models.Model):
    name_size = models.CharField(max_length=255, choices=SIZES)
    price_food_small = models.DecimalField(max_digits=10, decimal_places=2)
    price_food_large = models.DecimalField(max_digits=10, decimal_places=2)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)

    def __str__(self):
        return self.name_size


class Toppings(models.Model):
    name_toppings = models.CharField(max_length=255)
    price_toppings = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name_toppings

class Food_Toppings(models.Model):
    # otros campos de modelo
    toppings = models.ForeignKey(Toppings, on_delete=models.CASCADE)
    category_food = models.ForeignKey(Category_Food, on_delete=models.CASCADE, default=1)
    
    def __str__(self):
        return self.category_food


class Orders(models.Model):
    order_date = models.DateField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(choices=STATUS, max_length=64, default="pending")
    direccion_de_entrega = models.CharField(max_length=255)

    def __str__(self):
        return f"Order - Date: {self.order_date}"


class Order_Details(models.Model):
    orders = models.ForeignKey(Orders, on_delete=models.CASCADE)
    list_toppings = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)

    def __str__(self):
        return f"Order Details - Food: {self.food}, Quantity: {self.quantity}"


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    list_toppings = models.CharField(max_length=255)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    unitari_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    pub_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart: {self.food}, Toppings: {self.toppings}"
