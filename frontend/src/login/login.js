const btn = document.getElementById("login");

btn.addEventListener("click", async () => {
    const email = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validación de entrada
    if (!email || !password) {
        alert("Por favor, ingresa tu correo y contraseña.");
        return;
    }

    const datos = {
        email: email,
        contra: password
    };

    console.log(datos);

    try {
        // Realiza una solicitud GET para buscar el usuario por correo
        const response = await axios.get(`http://127.0.0.1:8000/usuarios/get/${email}`);

        // Verifica si el usuario existe y si la contraseña es correcta
        if (response.data.correo === email && response.data.contra === password) {
            // Guardar usuario en localStorage
            const usuario = { nombre: response.data.nombre }; // Suponiendo que el nombre viene en la respuesta
            localStorage.setItem('usuarioGuardado', JSON.stringify(usuario));

            alert(`Usuario guardado: ${usuario.nombre}`);
            window.location.href = '../index.html'; // Redirigir a la página deseada
        } else {
            console.log("No se encontró ningún usuario con ese correo.");
            alert("Usuario o contraseña incorrectas.");
        }
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        alert("Ocurrió un error al intentar obtener los datos del usuario.");
    }
});
