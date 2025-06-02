const API_URL = "http://localhost:3000";

  // Validación de RUT chileno
  function validarRut(rutCompleto) {
    rutCompleto = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rutCompleto.length < 2) return false;

    const cuerpo = rutCompleto.slice(0, -1);
    const dv = rutCompleto.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    return dv === dvFinal;
  }

  // Evento del formulario
  document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const rut = document.getElementById('rut').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!validarRut(rut)) {
      alert('RUT inválido');
      return;
    }

    try {
      const res = await fetch( axios.get(`http://127.0.0.1:8000/usuarios/get/${rut}`));
      const data = await res.json();

      if (data.existe) {
        alert('Este RUT ya está registrado.');
        return;
      }

      // Si no está registrado, puedes continuar enviando el formulario
      // Simulamos recolección de datos y envío
      const datos = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        rut,
        email,
        telefono: document.getElementById('phone').value,
        fecha: document.querySelector('[name="fecha"]').value,
        direccion: document.getElementById('address').value,
        password: document.getElementById('password').value,
        tipo: value("Cliente")
    };

      const response = await fetch(axios.get(`http://127.0.0.1:8000/usuarios/add/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      if (response.ok) {
        alert('Cliente registrado con éxito ✅');
        this.reset();
      } else {
        const err = await response.json();
        alert('Error al registrar: ' + err.error);
      }

    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error en la conexión al servidor');
    }
  });