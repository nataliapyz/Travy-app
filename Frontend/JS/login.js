document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const email = document.getElementById("usuario").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:8080/api/usuarios/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                if (!response.ok) throw new Error("Usuario o contraseña incorrectos");
                const usuario = await response.json();
                localStorage.setItem("token", usuario.id); // Guardamos el ID
                localStorage.setItem("usuario", usuario.name); // Guardamos el nombre
                window.location.href = "viajes.html"; // Redirigimos a sus viajes
            } catch (error) {
                alert(error.message);
            }
        });
    }
});
