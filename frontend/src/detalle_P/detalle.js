const STORAGE_KEY = 'carrito';
    let productoActual = null; // Variable global para guardar el producto

    document.addEventListener("DOMContentLoaded", () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id_p = urlParams.get('id_p');
      if (!id_p) {
        alert('No se encontró el ID del producto');
        return;
      }

      fetch(`http://localhost:3000/Productos/${id_p}`)
        .then(response => {
          if (!response.ok) throw new Error('Producto no encontrado');
          return response.json();
        })
        .then(producto => {
          productoActual = producto; // Guardar para uso posterior

          document.getElementById('nombre').textContent = producto.nombre;
          document.getElementById('descripcion').textContent = producto.descripcion;
          document.getElementById('precio').textContent = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
          }).format(producto.precio);
          document.getElementById('marca').textContent = producto.marca;
          document.getElementById('tipo').textContent = producto.tipo;
          document.getElementById('stock').textContent = producto.stock;
          document.getElementById('product-image').src = producto.imagen || 'https://cdn-icons-png.flaticon.com/512/2921/2921823.png';
        })
        .catch(err => alert(err.message));

      document.getElementById('addCartBtn').addEventListener('click', () => {
        const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
        if (cantidad < 1) {
          alert('Ingrese una cantidad válida');
          return;
        }

        if (!productoActual) {
          alert('No se ha cargado el producto');
          return;
        }

        const productId = id_p;
        const nombre = productoActual.nombre;
        const precio = parseInt(productoActual.precio);
        const imagen = productoActual.imagen || 'https://cdn-icons-png.flaticon.com/512/2921/2921823.png';

        let carrito = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        if (carrito[productId]) {
          carrito[productId].cantidad += cantidad;
        } else {
          carrito[productId] = { nombre, precio, cantidad, imagen };
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
        alert('Producto agregado al carrito');
        // actualizarContadorCarrito(); // Solo si esta función existe
      });
    });