from django.contrib import admin
from orders.models import Food, Category_Food, Size_Food, Toppings,Food_Toppings,Order_Details,Orders

# Register your models here.
admin.site.register(Food)
admin.site.register(Category_Food)
admin.site.register(Size_Food)
admin.site.register(Toppings)
admin.site.register(Food_Toppings)
admin.site.register(Orders)
admin.site.register(Order_Details)


