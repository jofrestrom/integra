document.getElementById('loginButton').addEventListener('click', function () {
  window.location.href = 'login/login.html';
});

document.getElementById('cartButton').addEventListener('click', ()=>{
  window.location.href = 'carrito/carrito.html';

})
const scrollAmount = 240;
function crearTarjeta(producto) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.tabIndex = 0;
  div.innerHTML = `
        <img src="https://cdn-icons-png.flaticon.com/512/2921/2921823.png" alt="${producto.nombre}" class="product-img" />
        <h2 class="product-name">${producto.nombre}</h2>
        <p class="product-desc" title="${producto.descripcion}">${producto.descripcion}</p>
        <div class="product-price">${new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(producto.precio)}</div>
      `;
  div.addEventListener('click', () => {
    window.location.href = `detalle_P/detalle_p.html?id_p=${producto.id_p}`;
  });
  div.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      window.location.href = `detalle_P/detalle_p.html?id_p=${producto.id_p}`;
    }
  });
  return div;
}

document.getElementById('search-button').addEventListener('click', async () => {
  const searchTerm = document.getElementById('search-input').value;
  if (searchTerm) {
    fetch(`http://localhost:3000/productos/n/${searchTerm}`)
      .then(response => response.json())
      .then(data => {
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = ''; // Limpiar resultados anteriores
        if (data.length > 0) {
          data.forEach(producto => {
            const div = document.createElement('div');
            window.location.href = `detalle_P/detalle_p.html?id_p=${producto.id_p}`;
            resultsContainer.appendChild(div);
          });
        } else {
          resultsContainer.textContent = 'No se encontraron productos.';
        }
      })
      .catch(err => console.error('Error al buscar productos:', err));
  } else {
    alert('Por favor, ingresa un nombre para buscar.');
  }
});

async function cargarProductos() {
  try {
    const respuesta = await axios.get('http://localhost:3000/productos');
    const productos = respuesta.data;

    // Clasificar productos
    const manuales = productos.filter(p => p.tipo.toLowerCase() === 'manual');
    const electricos = productos.filter(p => p.tipo.toLowerCase() === 'eléctrico' || p.tipo.toLowerCase() === 'electrico');
    const materiales = productos.filter(p => p.tipo.toLowerCase() === 'material');

    // Contenedores
    const manualContainer = document.getElementById('manual-carousel-inner');
    const electricoContainer = document.getElementById('electrico-carousel-inner');
    const materialContainer = document.getElementById('material-carousel-inner');

    manuales.forEach(p => manualContainer.appendChild(crearTarjeta(p)));
    electricos.forEach(p => electricoContainer.appendChild(crearTarjeta(p)));
    materiales.forEach(p => materialContainer.appendChild(crearTarjeta(p)));

  } catch (error) {
    console.error('Error al cargar productos:', error);
    alert('No se pudo cargar la lista de productos. Verifica que el servidor esté activo y la URL correcta.');
  }
}

function setupCarouselButtons() {
  const buttons = document.querySelectorAll('.carousel-btn');
  buttons.forEach(button => {
    button.addEventListener('click', e => {
      const targetId = button.getAttribute('data-target');
      const direction = button.getAttribute('data-direction');
      const carousel = document.getElementById(targetId);
      if (!carousel) return;
      if (direction === 'left') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      resetAutoScroll(carousel);
    });
  });
}
const autoScrollIntervals = new Map();

function startAutoScroll(carousel) {
  if (autoScrollIntervals.has(carousel)) {
    clearInterval(autoScrollIntervals.get(carousel));
  }
  const interval = setInterval(() => {
    // Si está al final, volver al inicio suavemente
    if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 5) {
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, 7000);
  autoScrollIntervals.set(carousel, interval);
}

function resetAutoScroll(carousel) {
  if (autoScrollIntervals.has(carousel)) {
    clearInterval(autoScrollIntervals.get(carousel));
  }
  startAutoScroll(carousel);
}

function setupAutoScroll() {
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    startAutoScroll(carousel);
    // Reiniciar temporizador si el usuario hace scroll manual
    carousel.addEventListener('scroll', () => {
      resetAutoScroll(carousel);
    });
  });
}

window.onload = () => {
  cargarProductos()
    .then(() => {
      setupCarouselButtons();
      setupAutoScroll();
    });
};
// Función para mostrar el usuario guardado y ocultar botón si usuario existe
function mostrarUsuarioGuardado() {

  const usuarioJSON = localStorage.getItem('usuarioGuardado');
  const loginBtn = document.getElementById('loginButton');
  const welcomeElem = document.getElementById('user');

  if (usuarioJSON) {
    try {
      const usuario = JSON.parse(usuarioJSON);
      // Mostrar mensaje de bienvenida
      if (welcomeElem) {
        welcomeElem.textContent = `Bienvenido, ${usuario.nombre}!`;
      }
      // Ocultar botón de login
      if (loginBtn) {
        loginBtn.style.display = 'none'; // Oculta el botón si hay usuario
      }
    } catch (error) {
      console.error("Error al parsear el usuario guardado:", error);
    }
  } else {
    console.log("No hay usuario guardado.");
    if (loginBtn) {
      loginBtn.style.display = 'inline-block';
    }
    if (welcomeElem) {
      welcomeElem.textContent = "Hola, Eres Nuevo?!";
    }
  }
}

const STORAGE_KEY = 'carrito';

function actualizarContadorCarrito() {
    let carrito = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    let totalCantidad = 0;

    for (const id in carrito) {
        totalCantidad += carrito[id].cantidad; // Sumar la cantidad de cada producto
    }

    document.getElementById('cartCount').textContent = totalCantidad; // Actualizar el contador en el botón
}

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  mostrarUsuarioGuardado();
  actualizarContadorCarrito();
});

