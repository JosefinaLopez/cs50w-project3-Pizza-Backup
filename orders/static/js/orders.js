//!Funcion de los tokens

document.addEventListener('DOMContentLoaded', () => {
    let path = window.location.pathname;
    const parts = path.split('/');
    const idOrder = parts[parts.length - 1];
    let dir = document.getElementById("direction");
    dir.addEventListener("click",() =>{
        RegistrarDetalleOrden();

    });
    let order = document.getElementById("ordersxd");
    order.addEventListener("click",() =>{
        fetch('orders_details/' + idOrder, {
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
                    text: data.message,
                    icon: 'success',
                })
                window.location.href = `orders_details/${data.id}/`
            })
            .catch(error => {

                console.error('Hubo un error:', error);
            });
    })
    
})

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


function RegistrarDetalleOrden() {
    let iduser = document.getElementById("id_user").value;
}


