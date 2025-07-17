let todosLosViajes = [];
document.addEventListener("DOMContentLoaded", function () {
    const usuario = localStorage.getItem("usuario");
    if (!usuario) {
        window.location.href = "login.html";
    } else {
        const nombreElemento = document.getElementById("usuarioNombre");
        if (nombreElemento) {
            nombreElemento.textContent = usuario;
        }
    }
    fetchViajes();
});

async function fetchViajes() {
    try {
        const usuarioId = localStorage.getItem("token");
        if (!usuarioId) {
            alert("No hay usuario en sesión");
            window.location.href = "login.html";
            return;
        }

        const response = await fetch(`http://localhost:8080/viajes/usuario/${usuarioId}`);
        if (!response.ok) throw new Error("Error al obtener los viajes del usuario");

        const viajes = await response.json();
        todosLosViajes = viajes;
        renderViajes(viajes);
    } catch (error) {
        console.error("Error:", error);
    }
}

function renderViajes(viajes) {
    const container = document.getElementById("viajesContainer");
    const emptyState = document.getElementById("emptyState");

    if (viajes.length === 0) {
        emptyState.style.display = "block";
        container.innerHTML = "";
        const btnEmpezar = document.querySelector(".btn-login");
        if (btnEmpezar) {
            btnEmpezar.addEventListener("click", () => {
                window.location.href = "crear.html";
            });
        }
        return;
    } else {
        emptyState.style.display = "none";
    }


    container.innerHTML = "";

    viajes.forEach((viaje) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.style.position = "relative";
        card.style.backgroundImage = `url('http://localhost:8080/Subidas/${viaje.imagenPortada || "default.jpg"}')`;
        card.classList.add("tarjeta-viaje"); // para que podamos usar el filtro y este las seleccione
        card.setAttribute("data-categoria", viaje.categoria?.id || 0); // para saber su categoria


        const text = document.createElement("div");
        text.classList.add("card-te" +
            "xt");
        text.innerHTML = `
         <span class="titulo-viaje">${viaje.titulo}</span>
            <span class="fecha-viaje">${viaje.fecha}</span>
        `;
        text.style.cursor = "pointer";


        text.addEventListener("click", async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/detalles_viajes/byViajeId/${viaje.id}`);
                if (!res.ok) throw new Error("No se pudo encontrar detalles para este viaje");
                const detalles = await res.json();
                window.location.href = `crear.html?id=${detalles.id}`;
            } catch (error) {
                console.error("Error al redirigir:", error);
                alert("Este viaje aún no tiene detalles disponibles.");
            }
        });

        // Input para imagen
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";

        input.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("imagen", file);

                fetch(`http://localhost:8080/viajes/${viaje.id}/imagen`, {
                    method: "POST",
                    body: formData
                })
                    .then(res => res.text())
                    .then(nombreImagen => {
                        card.style.backgroundImage = `url('http://localhost:8080/Subidas/${nombreImagen}?v=${Date.now()}')`;
                    })
                    .catch(err => console.error("Error al subir imagen:", err));
            }
        });

        // Icono de cambiar
        const editIcon = document.createElement("img");
        editIcon.src = "../editar.png";
        editIcon.alt = "Opciones";
        editIcon.classList.add("edit-icon");
        editIcon.style.position = "absolute";
        editIcon.style.top = "-8px";
        editIcon.style.right = "-8px";
        editIcon.style.width = "24px";
        editIcon.style.height = "24px";
        editIcon.style.cursor = "pointer";
        editIcon.style.display = "none";

        card.addEventListener("mouseenter", () => {
            editIcon.style.display = "block";
        });
        card.addEventListener("mouseleave", () => {
            editIcon.style.display = "none";
            opcionesMenu.classList.add("d-none");
        });

        // Menú de opciones
        const opcionesMenu = document.createElement("div");
        opcionesMenu.classList.add("opciones-menu", "d-none");
        const btnCambiar = document.createElement("button");
        btnCambiar.classList.add("opcion");
        btnCambiar.textContent = "Cambiar foto de portada";
        const btnBorrar = document.createElement("button");
        btnBorrar.classList.add("opcion");
        btnBorrar.textContent = "Eliminar viaje";

        opcionesMenu.appendChild(btnCambiar);
        opcionesMenu.appendChild(btnBorrar);
        editIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            opcionesMenu.classList.toggle("d-none");
        });
        btnCambiar.addEventListener("click", (e) => {
            e.stopPropagation();
            opcionesMenu.classList.add("d-none");
            input.click();
        });
        btnBorrar.addEventListener("click", async (e) => {
            e.stopPropagation();
            opcionesMenu.classList.add("d-none");
            const confirmar = confirm("¿Estás segura/o de que quieres borrar este viaje?");
            if (!confirmar) return;

            try {
                await fetch(`http://localhost:8080/api/detalles_viajes/byViajeId/${viaje.id}`, { method: "DELETE" });
                await fetch(`http://localhost:8080/viajes/${viaje.id}`, { method: "DELETE" });
                fetchViajes();
            } catch (err) {
                console.error("Error al eliminar viaje:", err);
            }
        });

        card.appendChild(editIcon);
        card.appendChild(text);
        card.appendChild(input);
        card.appendChild(opcionesMenu);
        container.appendChild(card);
    });


    // Tarjeta para añadir nuevo viaje
    const addCard = document.createElement("div");
    addCard.classList.add("card", "planifica-card");
    addCard.style.backgroundImage = "url('http://localhost:8080/Subidas/default.jpg')";

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const text = document.createElement("p");
    text.textContent = "Planifica tu viaje";

     const icon = document.createElement("img");
    icon.src = "../mas.png";
    icon.alt = "Añadir viaje";
    icon.classList.add("mas-icon");
    overlay.appendChild(text);
    overlay.appendChild(icon);
    addCard.appendChild(overlay);
    container.appendChild(addCard);

    addCard.addEventListener("click", () => {
        window.location.href = "crear.html";
    });
    //La parte del menú de filtrar, para que nos permita ordenar por año
    const iconoFiltrar = document.getElementById("iconoFiltrar");
    const menu = document.getElementById("menuFiltroOrden");
    const filtroCategorias = document.getElementById("filtroCategorias");
    const menuOrdenar = document.getElementById("menuOrdenar");

// Mostrar u ocultar el menú principal
    iconoFiltrar.addEventListener("click", (e) => {
        e.stopPropagation(); // Evita que dispare el cierre global
        const algunMenuVisible =
            !menu.classList.contains("d-none") ||
            !filtroCategorias.classList.contains("d-none") ||
            !menuOrdenar.classList.contains("d-none");

        if (algunMenuVisible) {
            cerrarTodosLosMenus();
        } else {
            menu.classList.remove("d-none");
        }
    });

// Al hacer clic en los botones del menú principal
    document.getElementById("btnFiltroCategorias").addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.add("d-none");
        filtroCategorias.classList.remove("d-none");
        menuOrdenar.classList.add("d-none");
    });
    document.getElementById("btnOrdenarViajes").addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.add("d-none");
        filtroCategorias.classList.add("d-none");
        menuOrdenar.classList.remove("d-none");
    });

// Al hacer clic en cualquier parte fuera de los menús, cerrarlos
    document.addEventListener("click", (e) => {
        setTimeout(() => {
            if (
                !iconoFiltrar.contains(e.target) &&
                !menu.contains(e.target) &&
                !filtroCategorias.contains(e.target) &&
                !menuOrdenar.contains(e.target)
            ) {
                cerrarTodosLosMenus();
            }
        }, 0);
    });
    function cerrarTodosLosMenus() {
        menu.classList.add("d-none");
        filtroCategorias.classList.add("d-none");
        menuOrdenar.classList.add("d-none");
    }


    fetch("http://localhost:8080/api/categorias")
        .then(res => res.json())
        .then(categorias => {
            categorias.forEach(cat => {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = cat.id;
                checkbox.id = `cat-${cat.id}`;


                const label = document.createElement("label");
                label.htmlFor = checkbox.id;
                label.textContent = cat.name;


                const contenedor = document.createElement("div");
                contenedor.appendChild(checkbox);
                contenedor.appendChild(label);
                filtroCategorias.appendChild(contenedor);
                checkbox.addEventListener("change", aplicarFiltroCategorias);
            });
        });

    function aplicarFiltroCategorias() {
        const seleccionadas = Array.from(
            filtroCategorias.querySelectorAll("input[type=checkbox]:checked")
        ).map(cb => parseInt(cb.value));
        const tarjetas = document.querySelectorAll(".tarjeta-viaje");
        tarjetas.forEach(tarjeta => {
            const categoriaId = parseInt(tarjeta.dataset.categoria);
            if (seleccionadas.length === 0 || seleccionadas.includes(categoriaId)) {
                tarjeta.style.display = "block";
            } else {
                tarjeta.style.display = "none";
            }
        });
    }


    document.querySelectorAll('input[name="orden"]').forEach(radio => {
        radio.addEventListener("change", () => {
            const orden = radio.value;
            const viajesOrdenados = [...todosLosViajes].sort((a, b) => {
                return orden === "asc" ? a.fecha - b.fecha : b.fecha - a.fecha;
            });
            renderViajes(viajesOrdenados);
        });
    });

    //Lo que nos permite hacer logout
    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });


}
