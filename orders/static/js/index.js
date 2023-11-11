//!Funcionalidad de el modal de informacion del producto
function info_food(id, cid) {
    fetch('menu/order/' + id + '/' + cid)
        .then(response => {
            if (!response.ok) {
                throw new Error('La solicitud falló: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const container = document.querySelector('.cat');
            let img = document.getElementById(`imgfood-${id}`);
            img.src = data.image_food;

            let large = document.getElementById(`large-${id}`).innerHTML = 'Large Size - U$' + data.large_price;
            let price_large = document.getElementById(`flexRadioDefault1-${id}`).value = data.large_price;
            let price_small = document.getElementById(`flexRadioDefault2-${id}`).value = data.small_price;
            let small = document.getElementById(`small-${id}`).innerHTML = 'Small Size - U$' + data.small_price;
            let name = document.getElementById(`exampleModalLabel-${id}`).innerHTML = data.name_food;

            let toppings_div = document.getElementById(`toppings-${id}`);
            toppings_div.innerHTML = ''; // Elimina cualquier contenido existente

            if (Array.isArray(data.toppings)) {
                data.toppings.forEach(top => {
                    const div = document.createElement("div");
                    div.className = 'form-check'; // Clase CSS para formateo
                    div.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${top.name}" id="flexCheckIndeterminate_${top.toppings_id}">
                <label class="form-check-label"id="pricet" for="flexCheckIndeterminate_${top.toppings_id}" value="${top.price_toppings}">${top.name}  - U$ ${top.price_toppings}</label>
            `;
                    toppings_div.appendChild(div);
                });
            } else {
                console.error('Los datos de los toppings no son un array válido.');
            }

            console.log(data);
        })
        .catch(error => {
            console.error('Error: ' + error.message);
        });
}
//!Funcionalidad de los precios
var cant = 0.0;
var list_toppings = [];
var totalPrice = 0;

function totalprice(prod_id) {
    // ! botón de radio "Small"
    var size_small = document.getElementById(`flexRadioDefault2-${prod_id}`);
    var size_large = document.getElementById(`flexRadioDefault1-${prod_id}`);

    //!referencia a todos los checkboxes en la lista de toppings
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    var cantidad = parseInt(document.getElementById(`cantidad-${prod_id}`).value);
    //! variables para almacenar el precio total y la suma de precios
    let subtotal = 0;
    var small_z = parseFloat(size_small.value);
    var large_z = parseFloat(size_large.value);

    //! Verifica si el botón de radio small está seleccionado
    if (size_small.checked || size_large.checked) {
        checkboxes.forEach(function (checkbox) {
            if ( checkbox && checkbox.checked) {
                //! Obtiene el valor del atributo for de la etiqueta asociada al checkbox
                var labelFor = checkbox.getAttribute("id");
                //alert(labelFor)
                var label = document.querySelector(`label[for="${labelFor}"]`);
                var input = document.querySelector(`input#${labelFor}`);
                var tp = input.value;
                if (!list_toppings.includes(tp)) {
                    list_toppings.push(tp);
                }
                //alert(tp);
                //! Obtiene el valor del atributo "value" de la etiqueta y convertirlo a número
                var labelValue = parseFloat(label.getAttribute("value"));

                // !Verificara si labelValue es un número válido y agregarlo al precio total
                if (!isNaN(labelValue)) {
                    subtotal += labelValue;
                }
            }
        });
        if (size_small.checked) {
            //!Comprueba la cantidad de pizzas pedidas para la orden
            if (cantidad >= 1) {
                cant = small_z * cantidad;
                //alert(`la cantidad es de  ${cant}`);
            }
            else {
                cant = small_z;
            }
        }
        else if (size_large.checked) {
            //!Comprueba la cantidad de pizzas pedidas para la orden
            if (cantidad >= 1) {
                cant = large_z * cantidad;
                //alert(`la cantidad es de  ${cant}`);
            }
            else {
                cant = large_z;
            }
        }
        totalPrice = subtotal + cant;
        let xd = document.getElementById(`price-${prod_id}`);
        xd.innerText = `U$ ${totalPrice.toFixed(2)}`;
        //alert(totalPrice)
        //var pricelb = document.getElementById("price").value = "Price: U$ " + totalPrice.toFixed(2);
        //! Mostrara la suma de los precios seleccionados
        //alert("Total Price for Small Size: U$" + totalPrice);
        //alert(list_toppings);
    }
}

//!Funcion de los tokens
function getCSRFToken() {
    var name = "csrftoken=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return null;
}

//!Envio de Informacion al carrito
function cart(prod_id) {

    let user_id = document.getElementById("userid").value;
    var cantidad = parseInt(document.getElementById(`cantidad-${prod_id}`).value);

    //alert(prod_id);
    // Obtén el token CSRF de las cookies
    const data = {
        producto: prod_id,
        cantidad: cantidad,
        precio: cant,
        toppings: list_toppings,
        total: totalPrice,
        usuario: user_id
    };
    fetch('cartxd/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()// Incluye el token CSRF en el encabezado
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(data => {

            console.log(data);
            Swal.fire({
                title: 'Exito!',
                text: 'Producto agregado al carrito',
                icon: 'success',
            })
            ready();
            // alert("Su Orden ha sido Agregada al Carrito");
        })
        .catch(error => {

            console.error('Hubo un error:', error);
        });
}

//!Funcionalidad General del Carrito
function ready() {
    fetch("cart/views/")
        .then(response => response.json())
        .then(data => {
            const productosLista = document.getElementById("container");
            var xd = document.getElementById("cant").value = data.cant;
            //alert(xd)
            productosLista.innerHTML = '';
            if (Array.isArray(data.cart)) {
                data.cart.forEach(item => {
                    const listItem = document.createElement("li");
                    listItem.className = "list-group-item d-flex justify-content-between align-items-center";

                    const contentDiv = document.createElement("div"); // Contenedor para el contenido del item
                    const checkboxDiv = document.createElement("div");
                    checkboxDiv.className = "form-check me-3";
                    const checkbox = document.createElement("input");
                    checkbox.className = "form-check-input";
                    checkbox.style.width = "25px";
                    checkbox.style.height = "25px";
                    checkbox.style.marginRight = "-49px";
                    checkbox.type = "checkbox";
                    checkbox.value = item.id;
                    checkbox.id = `checkbox-${item.id}`;
                    checkbox.dataset.id = item.id; // Establece el atributo data-id con el ID del artículo
                    checkbox.dataset.precio = parseFloat(item.total_price);
                    listItem.appendChild(checkbox);
                    contentDiv.appendChild(checkboxDiv);
                    let cant = document.getElementById("cart");
                    cant.innerHTML = `<i class="bi bi-cart4" id='cant'></i> ${data.cant}`
                    //alert(data.cant);


                    checkbox.addEventListener("click", function () {
                        xdtotal(); // Llama a la función orderstotal cuando se hace clic en el checkbox
                    });
                    // Imagen del producto
                    const img = document.createElement("img");
                    img.src = item.image_food;
                    img.alt = "Producto";
                    img.className = "product-image"; // Agrega clase de margen a la derecha
                    listItem.appendChild(img);

                    // Agrega el contenido del item al contentDiv
                    const itemContent = document.createElement("div");
                    itemContent.innerHTML = `<strong style='color: blue;'>${item.food__name_food}</strong><br>
                                <strong style='color: green;'>Price: C$ ${item.total_price}</strong><br>
                                <strong>Quantity: </strong>${item.quantity}<br>
                                <strong>Toppings: </strong>${item.list_toppings}`;
                    listItem.appendChild(itemContent);

                    //!Botón de eliminar
                    const deleteButton = document.createElement("button");
                    deleteButton.className = "btn btn-danger";
                    deleteButton.textContent = "Eliminar";
                    listItem.appendChild(contentDiv);
                    listItem.appendChild(deleteButton);

                    productosLista.appendChild(listItem);
                    xd.text = data.cart;
                    let quantitybtn = document.createElement("input");
                    quantitybtn.value = item.quantity;
                    quantitybtn.id = "cantidad";
                    quantitybtn.type = "hidden";

                    let pricebtn = document.createElement("input");
                    pricebtn.value = item.total_price;
                    pricebtn.type = "hidden";
                    pricebtn.id = "price-" + item.id;

                    contentDiv.appendChild(quantitybtn);
                    contentDiv.appendChild(pricebtn);

                    deleteButton.addEventListener("click", function () {
                        deletecart();
                    });
                });
            } else {
                console.error("El campo 'cart' en los datos no es un array válido.");
            }
        })
        .catch(error => {
            console.error("Error al obtener datos:", error);
        });
}

function xdtotal() {
    const checkboxes = document.querySelectorAll(".form-check-input");
    let cant = 0;
    let precioTotal = 0; // Variable para almacenar el precio total
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const precio = parseFloat(checkbox.dataset.precio); // Obtiene el precio del checkbox actual
            // alert(precio);
            if (!isNaN(precio)) {
                cant += 1;
                precioTotal += precio; // Suma el precio del checkbox actual al total
            }
        }
        let totalabel = document.getElementById("totalt");
        let cantidadlabel = document.getElementById("cantidadt");
        totalabel.innerHTML = `<h6 style='color: green;'>Total: C$ ${precioTotal}</h6>`;
        cantidadlabel.innerHTML = `<h6 style='color: blue;'> Cantidad: ${cant}</h6>`
    });
}

function deletecart() {
    const checkboxes = document.querySelectorAll(".form-check-input");
    let selectedCheckboxId;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedCheckboxId = checkbox.dataset.id;
        }
    });

    if (selectedCheckboxId) {
        //alert(selectedCheckboxId);
        fetch(`cart/delete/${selectedCheckboxId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken()
            },
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('La respuesta de la red no fue correcta.');
            })
            .then(data => {
                Swal.fire({
                    title: '¡Éxito!',
                    text: data.message, // Usar el mensaje recibido del servidor
                    icon: 'success'
                });
            })
        ready();
    } else {
        // Si no se seleccionó ningún checkbox
        Swal.fire({
            title: 'Error',
            text: 'Por favor, selecciona un artículo antes de eliminarlo.',
            icon: 'error'
        });
    }
}

async function getDataFromLink(url) {
    const request = await fetch(url)
    const data = await request.json()
    return data
}

function renderTemplate(foodName, foodDescription, foodCategoryId, foodId, foodSizeName, foodImage, foodSmallPrice) {
    return `
    <style>
        h4{
            text-align: center;
        }
    </style>
    <div class="categorias" style='width: 20rem;height: 30rem;'>
    <span class='btncat'>${foodSizeName}</span>
    <div class="card" style="width: 20rem;height: 30rem;">
        <input type="hidden" name="category_id" value='${foodCategoryId}'>
            <img src="${foodImage}" class="card-img-top" alt="${foodName} with ${foodSizeName} size">
        <div class="card-body">
            <h5 class="card-title">${foodName}</h5>
            <p class="card-text">${foodDescription}.</p>

            <!--!Modal -->
            <div class="modal fade" id="exampleModal-${foodId}" tabindex="-1" aria-labelledby="exampleModalLabel"
                aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalLabel-${foodId}"></h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="product-container">
                                <!--!Contenedor de la imagen del producto -->
                                <div class="container-img">
                                    <img src="" alt="Food-Img" id="imgfood-${foodId}">
                                    <!--!Cantidad-->
                                    <h4>Cantidad</h4>
                                    <hr>
                                    <div class="number-input" style='display: flex; justify-content:center;'>
                                        <input type="number" value="1" min="1" id="cantidad-${foodId}" onclick="totalprice('${foodId}')">
                                    </div>
                                </div>
                                <!--!Contenedor de la información -->
                                <div class="container-inf">
                                    <!--!Tamaño -->
                                <div class="list-size">
                                <h4>Size</h4>
                                <hr>
                                <div class="form-check" onclick="totalprice('${foodId}')">
                                    <input class="form-check-input" type="radio" name="sizeRadio" id="flexRadioDefault1-${foodId}">
                                    <label class="form-check-label" for="flexRadioDefault1" id='large-${foodId}'></label>
                                </div>
                                <div class="form-check" onclick="totalprice('${foodId}')">
                                    <input class="form-check-input" type="radio" name="sizeRadio" id="flexRadioDefault2-${foodId}" checked>
                                    <label class="form-check-label" for="flexRadioDefault2" id='small-${foodId}'></label>
                                </div>
                                </div>

                                    <!--!Complementos -->
                                    <div class="list-toppings" onclick="totalprice('${foodId}')">
                                        <h4>Toppings</h4>
                                        <hr>
                                        <div class="form-check" id='toppings-${foodId}'>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer" style='justify-content: space-between;'>
                                <span> <h5 style='color: green;' id='price-${foodId}'></h5></span>
                                <div class="options">
                                <button type="button" onclick="cart('${foodId}')" class="btn btn-dark" id='cart'>
                                        <i class="bi bi-cart4"></i> Add To Cart
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!--!Button trigger modal -->
    <div onclick="info_food('${foodId}' , '${foodCategoryId}')" data-tooltip="Price:${foodSmallPrice}"
        class="button" id='btnorder' data-bs-toggle="modal" data-bs-target="#exampleModal-${foodId}">
        <div class="button-wrapper">
            <div class="text">Buy</div>
            <span class="icon">
                <svg viewBox="0 0 16 16" class="bi bi-cart2" fill="currentColor" height="16" width="16"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z">
                    </path>
                </svg>
            </span>
        </div>
    </div>
</div>
    `
}

function getLastFetch() {
    const lastFetch = localStorage.getItem('lastFetch')
    return lastFetch
}

function saveFetchToLocalStorage(url) {
    localStorage.setItem('lastFetch', url)
}

document.addEventListener('DOMContentLoaded', () => {
    localStorage.clear();
    const container = document.querySelector('.cat');
    const listOfCategories = document.querySelectorAll('.container-ct');
    const DEFAULT_URL = '/category/food/1';
    ready();
    async function loadCategoryData(url) {
        container.innerHTML = '';

        const data = await getDataFromLink(url);

        data.forEach(food => {
            container.innerHTML += renderTemplate(food.name_food, food.description, food.category_id, food.id, food.size_food__name_size, food.image_food, food.small_price);
        });

        saveFetchToLocalStorage(url);
    }

    loadCategoryData(DEFAULT_URL);


    listOfCategories.forEach($category => {
        $category.addEventListener('click', async (e) => {
            e.preventDefault();
            const link = e.target.getAttribute('href');

            if (link === getLastFetch()) {
                return;
            }
        });
    });
    // for the moment xd

    listOfCategories.forEach($category => {
        $category.addEventListener('click', async (e) => {
            e.preventDefault()
            //!Aqui modifique
            container.innerHTML = '';
            const link = e.target.getAttribute('href')
            if (link === getLastFetch()) {
                return
            }
            container.innerHTML = ''
            const data = await getDataFromLink(link)
            data.forEach(food => {
                container.innerHTML += renderTemplate(food.name_food, food.description, food.category_id, food.id, food.size_food__name_size, food.image_food, food.small_price)
            })
            saveFetchToLocalStorage(link)
            console.log(data)
        })
    })

    //!Region del Modal 2 
    var orderButton = document.getElementById('order');

    orderButton.addEventListener('click', function () {
        $('#addressModal').modal('show');
    });
    let info = document.getElementById("direction");
    info.addEventListener("click", function () {
        let iduser = document.getElementById("id_user").value;
        let dire = document.getElementById("address").value;
        const data = {
            user_id: iduser,
            direccion: dire
        };
        fetch('orders/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()// Incluye el token CSRF en el encabezado
            },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud');
                }
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    title: 'Exito!',
                    text: 'Direccion Agregada',
                    icon: 'success',
                })
                window.location.href = `orders_details/${data.id}/`
            })
            .catch(error => {

                console.error('Hubo un error:', error);
            });
    });

})