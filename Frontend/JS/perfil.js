document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem("token");
    let nombreOriginal = "";

    if (!usuarioId) {
        alert("No hay usuario en sesión.");
        window.location.href = "login.html";
        return;
    }


    //CARGAR PERFIL
    fetch(`http://localhost:8080/api/usuarios/${usuarioId}`)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el perfil del usuario");
            return response.json();
        })
        .then(data => {
            nombreOriginal = data.name;
            document.getElementById('nombre').value = data.name || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('password').value = "";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("No se pudo cargar el perfil del usuario");
        });

    //  GUARDAR CAMBIOS
    const guardarBtn = document.getElementById("guardarCambios");
    if (guardarBtn) {
        guardarBtn.addEventListener("click", () => {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            if (!email || !password) {
                alert("Debes rellenar todos los campos antes de guardar los cambios");
                return;
            }

            fetch(`http://localhost:8080/api/usuarios/${usuarioId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: nombreOriginal,
                    email: email,
                    password: password
                })
            })
                .then(res => {
                    if (!res.ok) throw new Error("Error al actualizar usuario");
                    return res.json();
                })
                .then(data => {
                    alert("Perfil actualizado correctamente");
                })
                .catch(err => {
                    console.error("Error:", err);
                    alert("Hubo un problema al actualizar el perfil");
                });
        });
    }

    // VOLVER
    document.getElementById("volverBtn").addEventListener("click", () => {
        window.history.back();
    });
    // CERRAR SESIÓN
    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });
});



