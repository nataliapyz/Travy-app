document.addEventListener("DOMContentLoaded", function () {
    const registroForm = document.getElementById("registroForm");
    if (registroForm) {
        registroForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:8080/api/usuarios", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: nombre, email, password })
                });
                //  alertas por si no funciona el registro
                if (!response.ok) {
                    let mensaje = "El email utilizado ya está registrado";

                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.message) {
                            mensaje = errorData.message;
                        }
                    } catch {
                        // Si no es en formato JSON, pues cogemos el texto plano
                        mensaje = await response.text();
                    }
                    alert("Error al crear usuario: " + mensaje);
                    return;
                }

                alert("¡Usuario creado correctamente!");
                window.location.href = "login.html";
            } catch (error) {
                alert("Error al crear usuario: " + error.message);
            }
        });
    }
});

