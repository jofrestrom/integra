const STORAGE_KEY = 'carrito';

function cargarCarrito() {
  const carrito = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const container = document.getElementById('carrito-container');
  const totalDiv = document.getElementById('total');

  container.innerHTML = '';
  totalDiv.textContent = '';

  const productos = Object.entries(carrito);
  if (productos.length === 0) {
    container.innerHTML = '<p class="empty">El carrito está vacío.</p>';
    return;
  }

  let total = 0;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = `
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Precio Unitario</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th>Acciones</th>
        </tr>
      `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  productos.forEach(([id, item]) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
          <td><img src="${item.imagen}" alt="${item.nombre}" /></td>
          <td>${item.nombre}</td>
          <td>${formatCLP(item.precio)}</td>
          <td>${item.cantidad}</td>
          <td>${formatCLP(subtotal)}</td>
          <td class="acciones">
            <button onclick="eliminarProducto('${id}')">Eliminar</button>
          </td>
        `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
  totalDiv.textContent = `Total: ${formatCLP(total)}`;
}

function eliminarProducto(id) {
  const carrito = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  delete carrito[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
  cargarCarrito();
}

function formatCLP(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(value);
}

const payBtn = document.getElementById('pay-btn');

if (payBtn) {
  payBtn.addEventListener('click', () => {
    const carrito = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const precio = carrito.precio || 0;

    // Guardar el precio en localStorage para usarlo en metodo_P.html
    localStorage.setItem('precio_final', precio);

    // Redirigir a la página de método de pago
    window.location.href = '../metodo_P/metodo_P.html';
  });
} else {
  console.warn('Botón de pago no encontrado');
}


document.addEventListener('DOMContentLoaded', cargarCarrito);