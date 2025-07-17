document.addEventListener("DOMContentLoaded", async function () {
    let detalleId = new URLSearchParams(window.location.search).get("id");
    let viajeId = null;
    const usuarioId = localStorage.getItem("token");
    const h2Titulo = document.getElementById("tituloViaje");
    const inputTitulo = document.getElementById("inputTitulo");
    const h5Fecha = document.getElementById("fechaViaje");
    const inputFecha = document.getElementById("inputFecha");

    if (!usuarioId) {
        alert("No hay usuario en sesión");
        window.location.href = "login.html";
        return;
    }
    try {
        if (!detalleId) {
            //Crear el viaje con el usuario
            const viajeRes = await fetch("http://localhost:8080/viajes", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    titulo: "Ciudad",
                    fecha: new Date().getFullYear(),
                    usuario: {id: parseInt(usuarioId)},
                    categoria: null
                })
            });

            if (!viajeRes.ok) throw new Error("Error al crear el viaje");
            const viaje = await viajeRes.json();
            viajeId = viaje.id;

            // Crear los detalles del viaje
            const detallesRes = await fetch("http://localhost:8080/api/detalles_viajes", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    viaje: {id: viajeId},
                    diario: "",
                    checklist: "[]",
                    presupuesto: "[]",
                    fotos: "[]",
                    mapaFoto: ""
                })
            });


            if (!detallesRes.ok) throw new Error("Error al crear detalles del viaje");
            const detalles = await detallesRes.json();
            detalleId = detalles.id;
            // Redirigir a esta misma página con el ID en la URL
            window.location.href = `crear.html?id=${detalleId}`;
        } else {
            cargarDetalles(detalleId); // Si ya existe, pues cargamos la pagina
        }
    } catch (err) {
        console.error("Error al crear viaje y detalle:", err);
        alert("Hubo un problema al crear el viaje. Intenta de nuevo.");
    }
//  FUNCIONALIDAD DE EDICIÓN DE TÍTULO Y FECHA
    h2Titulo.addEventListener("click", () => {
        inputTitulo.value = h2Titulo.textContent;
        h2Titulo.classList.add("d-none");
        inputTitulo.classList.remove("d-none");
        inputTitulo.focus();
    });
    inputTitulo.addEventListener("blur", () => {
        actualizarTitulo();
    });
     inputTitulo.addEventListener("blur", cancelarEdicionTitulo);

    function actualizarTitulo() {
        const nuevoTitulo = inputTitulo.value.trim();
        if (!nuevoTitulo || !viajeId) return;
        const fechaActual = parseInt(h5Fecha.textContent.trim());
        fetch(`http://localhost:8080/viajes/${viajeId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                titulo: nuevoTitulo,
                fecha: fechaActual
            })
        })
            .then(res => res.json())
            .then(data => {
                h2Titulo.textContent = data.titulo || "Ciudad";
                inputTitulo.classList.add("d-none");
                h2Titulo.classList.remove("d-none");
            })
            .catch(err => console.error("Error al actualizar título:", err));
    }
    function cancelarEdicionTitulo() {
        inputTitulo.classList.add("d-none");
        h2Titulo.classList.remove("d-none");
    }


    h5Fecha.addEventListener("click", () => {
        inputFecha.value = h5Fecha.textContent;
        h5Fecha.classList.add("d-none");
        inputFecha.classList.remove("d-none");
        inputFecha.focus();
    });
    inputFecha.addEventListener("blur", () => {
        actualizarFecha();
    });
    inputFecha.addEventListener("blur", cancelarEdicionFecha);
    function actualizarFecha() {
        const nuevaFecha = parseInt(inputFecha.value.trim());
        if (!nuevaFecha || !viajeId) return;
        const tituloActual = h2Titulo.textContent.trim();
        fetch(`http://localhost:8080/viajes/${viajeId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                titulo: tituloActual,
                fecha: nuevaFecha
            })
        })
            .then(res => res.json())
            .then(data => {
                h5Fecha.textContent = data.fecha || "Año";
                inputFecha.classList.add("d-none");
                h5Fecha.classList.remove("d-none");
            })
            .catch(err => console.error("Error al actualizar fecha:", err));
    }
    function cancelarEdicionFecha() {
        inputFecha.classList.add("d-none");
        h5Fecha.classList.remove("d-none");
    }



// === EXPANDIR LA TARJETA DE DIARIO
    function expandirTarjeta(elemento) {
        const estaExpandida = elemento.classList.contains('expandida');
        if (estaExpandida) {
            elemento.classList.remove('expandida');
        } else {
            document.querySelectorAll('.tarjeta-expandible').forEach(t => t.classList.remove('expandida'));
            elemento.classList.add('expandida');
        }
    }
    const tarjetas = document.querySelectorAll('.tarjeta-expandible');
    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('click', function (event) {
            if (event.target.tagName !== 'TEXTAREA' && !event.target.closest('textarea')) {
                expandirTarjeta(this);
            }
        });
    });
    function cargarDetalles(id) {
        fetch(`http://localhost:8080/api/detalles_viajes/${id}`)
            .then(res => res.json())
            .then(data => {
                viajeId = data.viaje?.id;
                document.getElementById("tituloViaje").textContent = data.viaje?.titulo || "Ciudad";
                document.getElementById("fechaViaje").textContent = data.viaje?.fecha || "¿En qué año lo hiciste?";
                cargarChecklist(data);
                cargarPresupuesto(data);
                document.getElementById("diarioTexto").value = data.diario || "";
                const diarioTextarea = document.getElementById("diarioTexto");

                diarioTextarea.addEventListener("blur", () => {
                    const texto = diarioTextarea.value;
                    fetch(`http://localhost:8080/api/detalles_viajes/${detalleId}/diario`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ diario: texto })
                    })
                        .then(res => {
                            if (!res.ok) throw new Error("Error al guardar diario");
                        })
                        .catch(err => console.error("Error al guardar diario:", err));
                });


                // VISUAL como fondo dinámico
                let fotos = JSON.parse(data.fotos || "[]");
                let fotoActual = 0;
                const visualFondo = document.getElementById("tarjeta-visual-fondo");
                const btnPrev = document.getElementById("prevFoto");
                const btnNext = document.getElementById("nextFoto");

                function mostrarFoto() {
                    if (fotos.length > 0) {
                        const url = fotos[fotoActual];
                        visualFondo.style.backgroundImage = `url('${url}')`;
                    } else {
                        visualFondo.style.backgroundImage = "url('../visualDefault.jpg')";
                    }
                }
                mostrarFoto();
                btnNext.addEventListener("click", () => {
                    if (fotos.length === 0) return;
                    fotoActual = (fotoActual + 1) % fotos.length;
                    mostrarFoto();
                });
                btnPrev.addEventListener("click", () => {
                    if (fotos.length === 0) return;
                    fotoActual = (fotoActual - 1 + fotos.length) % fotos.length;
                    mostrarFoto();
                });

                // SUBIR VARIAS FOTOS DESDE VISUAL
                const inputFoto = document.getElementById("inputFoto");
                const editarFotos = document.getElementById("editarFotos");

                editarFotos.addEventListener("click", () => {
                    inputFoto.click();
                });

                inputFoto.addEventListener("change", function () {
                    const files = this.files;
                    if (!files.length || !detalleId) return;

                    const formData = new FormData();
                    for (const file of files) {
                        formData.append("foto", file);
                    }
                    fetch(`http://localhost:8080/api/detalles_viajes/${detalleId}/fotos`, {
                        method: "POST",
                        body: formData
                    })
                        .then(res => {
                            if (!res.ok) throw new Error("Error al subir fotos");
                            return res.json();
                        })
                        .then(fotosActualizadas => {
                            fotos = fotosActualizadas;
                            if (fotos.length > 0) {
                                fotosVisor = fotos;
                                fotoActual = fotos.length - 1;
                                mostrarFoto();
                            }
                        })
                        .catch(err => console.error("Error al subir fotos:", err));
                });

                // VISOR DE FOTOS CUANDO HACEMOS CLICK
                const visor = document.getElementById("visorFotos");
                const visorImg = document.getElementById("visorImagen");
                const btnCerrar = document.getElementById("cerrarVisor");
                const btnPrevVisor = document.getElementById("anteriorFoto");
                const btnNextVisor = document.getElementById("siguienteFoto");
                let fotosVisor = fotos;
                // Lo que nos permite hacer click en la tarjeta para abrir visor
                visualFondo.addEventListener("click", () => {
                    if (fotosVisor.length === 0) return;
                    visor.classList.remove("d-none");
                    visorImg.src = fotosVisor[fotoActual];
                });
                btnCerrar.addEventListener("click", () => {
                    visor.classList.add("d-none");
                });
                btnNextVisor.addEventListener("click", () => {
                    if (fotosVisor.length === 0) return;
                    fotoActual = (fotoActual + 1) % fotosVisor.length;
                    visorImg.src = fotosVisor[fotoActual];
                });
                btnPrevVisor.addEventListener("click", () => {
                    if (fotosVisor.length === 0) return;
                    fotoActual = (fotoActual - 1 + fotosVisor.length) % fotosVisor.length;
                    visorImg.src = fotosVisor[fotoActual];
                });

                // Permite eliminar la fotografía que queramos desde el visor
                const btnEliminarVisor = document.getElementById("eliminarFotoVisor");
                btnEliminarVisor.addEventListener("click", async () => {
                    if (!fotosVisor.length) return;

                    const confirmar = confirm("¿Seguro que quieres eliminar esta foto?");
                    if (!confirmar) return;
                    const fotoAEliminar = fotosVisor[fotoActual];

                    try {
                        const res = await fetch(`http://localhost:8080/api/detalles_viajes/${detalleId}`);
                        if (!res.ok) throw new Error("No se pudo obtener detalles del viaje");
                        const data = await res.json();
                        const fotosActuales = JSON.parse(data.fotos || "[]");
                        // Elimina la foto actual del array para que no se vea si la hemos eliminado
                        const nuevasFotos = fotosActuales.filter(f => f !== fotoAEliminar);
                        // Con esto actualizamos el campo 'fotos' en la BBDD
                        await fetch(`http://localhost:8080/api/detalles_viajes/${detalleId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                ...data,
                                fotos: JSON.stringify(nuevasFotos)
                            })
                        });

                        // Actualiza el visor y fondo visual
                        fotosVisor = nuevasFotos;
                        fotos = nuevasFotos;
                        if (fotosVisor.length === 0) {
                            visor.classList.add("d-none");
                            document.getElementById("tarjeta-visual-fondo").style.backgroundImage = "url('../visualDefault.jpg')";
                        } else {
                            fotoActual = Math.max(0, fotoActual - 1);
                            visorImg.src = fotosVisor[fotoActual];
                            document.getElementById("tarjeta-visual-fondo").style.backgroundImage = `url('${fotosVisor[fotoActual]}')`;
                        }
                    } catch (err) {
                        console.error("Error al eliminar la foto:", err);
                        alert("Hubo un problema al eliminar la foto.");
                    }
                });


                // === MAPA
                if (data.mapaFoto) {
                    const url = `http://localhost:8080/Subidas/${data.mapaFoto}`;
                    const mapaTarjeta = document.getElementById("mapaTarjeta");
                    mapaTarjeta.style.backgroundImage = `url('${url}')`;
                    mapaTarjeta.style.backgroundSize = "cover";
                    mapaTarjeta.style.backgroundPosition = "center";
                }
            })
            .catch(err => console.error("Error al cargar detalles:", err));
    }
    //TARJETA DEL MAPA
    const editarMapaIcono = document.getElementById("editarMapa");
    const inputMapa = document.getElementById("inputMapa");
    editarMapaIcono.addEventListener("click", () => {
        inputMapa.click();
    });

    inputMapa.addEventListener("change", () => {
        const archivo = inputMapa.files[0];
        if (!archivo) return;
        const formData = new FormData();
        formData.append("imagen", archivo);

        fetch(`http://localhost:8080/api/detalles_viajes/${detalleId}/mapa`, {
            method: "POST",
            body: formData
        })
            .then(res => res.text())
            .then(nombreArchivo => {
                const mapaTarjeta = document.getElementById("mapaTarjeta");
                const url = `http://localhost:8080/Subidas/${nombreArchivo}`;
                mapaTarjeta.style.backgroundImage = `url('${url}')`;
                mapaTarjeta.style.backgroundSize = "cover";
                mapaTarjeta.style.backgroundPosition = "center";
                console.log("Foto de mapa subida con éxito:", nombreArchivo);
            })
            .catch(err => console.error("Error al subir la foto del mapa:", err));
    });


    //CHECKLIST
    const listaChecklist = document.getElementById("listaChecklist");
    const inputNuevo = document.getElementById("nuevoItem");
    const btnEditarChecklist = document.getElementById("editarChecklist");
    const formNuevoItem = document.getElementById("formNuevoItem");
    let checklist = [];

    if (btnEditarChecklist && formNuevoItem) {
        btnEditarChecklist.addEventListener("click", () => {
            const visible = formNuevoItem.style.display === "block";
            formNuevoItem.style.display = visible ? "none" : "block";
            if (!visible) inputNuevo.focus();
        });
    }
    function cargarChecklist(data) {
        try {
            checklist = JSON.parse(data.checklist || "[]");
        } catch {
            checklist = [];
        }
        renderizarChecklist();
    }

    function guardarChecklist() {
        fetch(`http://localhost:8080/api/detalles_viajes/${detalleId}/checklist`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(checklist)
        });
    }
    function renderizarChecklist() {
        listaChecklist.innerHTML = "";
        checklist.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "d-flex align-items-center justify-content-between mb-2";
            li.innerHTML = `   
                <div class="d-flex align-items-center"> 
                    <input type="checkbox" class="form-check-input me-2" ${item.hecho ? "checked" : ""}>   
                    <span>${item.texto}</span>
                </div>
                ${item.hecho ? `<button class="btn btn-eliminar" style="background: none; border: none;"><img src="../papelera.png" style="width: 20px;"></button>` : ""}
            `;
            const checkbox = li.querySelector("input");
            checkbox.addEventListener("change", () => {
                checklist[index].hecho = checkbox.checked;
                guardarChecklist();
                renderizarChecklist();
            });
            const btnEliminar = li.querySelector(".btn-eliminar");
            if (btnEliminar) {
                btnEliminar.addEventListener("click", () => {
                    checklist.splice(index, 1);
                    guardarChecklist();
                    renderizarChecklist();
                });
            }
            listaChecklist.appendChild(li);
        });
    }
    if (inputNuevo) {
        inputNuevo.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                const texto = inputNuevo.value.trim();
                if (!texto) return;
                checklist.push({texto, hecho: false});
                inputNuevo.value = "";
                guardarChecklist();
                renderizarChecklist();
            }
        });
    }


    //  PRESUPUESTO
    const listaPresupuesto = document.getElementById("listaPresupuesto");
    const inputGasto = document.getElementById("nuevoGasto");
    const btnEditarPresupuesto = document.getElementById("editarPresupuesto");
    const formNuevoGasto = document.getElementById("formNuevoGasto");
    const totalPresupuesto = document.getElementById("totalPresupuesto");
    let presupuesto = [];

    if (btnEditarPresupuesto && formNuevoGasto) {
        btnEditarPresupuesto.addEventListener("click", () => {
            const visible = formNuevoGasto.style.display === "block";
            formNuevoGasto.style.display = visible ? "none" : "block";
            if (!visible) inputGasto.focus();
        });
    }

    function cargarPresupuesto(data) {
        try {
            presupuesto = JSON.parse(data.presupuesto || "[]");
        } catch {
            presupuesto = [];
        }
        renderizarPresupuesto();
    }
    function guardarPresupuesto() {
        fetch(`http://localhost:8080/api/detalles_viajes/${detalleId}/presupuesto`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(presupuesto)
        });
    }
    function renderizarPresupuesto() {
        listaPresupuesto.innerHTML = "";
        let total = 0;
        presupuesto.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "d-flex justify-content-between align-items-center mb-2";
            li.innerHTML = `
                <span>${item.nombre} – ${item.cantidad} €</span>
                <button class="btn btn-eliminar" style="background: none; border: none;"><img src="../papelera.png" style="width: 20px;"></button>
            `;
            li.querySelector(".btn-eliminar").addEventListener("click", () => {
                presupuesto.splice(index, 1);
                guardarPresupuesto();
                renderizarPresupuesto();
            });
            listaPresupuesto.appendChild(li);
            total += parseFloat(item.cantidad);
        });
        totalPresupuesto.textContent = `${total.toFixed(2)} €`;
    }
    if (inputGasto) {
        inputGasto.addEventListener("keypress", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                const valor = inputGasto.value.trim();
                const match = valor.match(/(.+)\s+(\d+(?:[.,]\d+)?)/);
                if (!match) return;
                const nombre = match[1];
                const cantidad = parseFloat(match[2].replace(",", "."));
                presupuesto.push({nombre, cantidad});
                inputGasto.value = "";
                guardarPresupuesto();
                renderizarPresupuesto();
            }
        });
    }
})
//Actualizamos la categoría
document.addEventListener("DOMContentLoaded", () => {
    const detalleId = new URLSearchParams(window.location.search).get("id");
    let idViaje = null;
    const selectCategoria = document.getElementById("categoriaSelect");
    const iconoCategoria = document.getElementById("abrirSelectorCategoria");
    iconoCategoria.addEventListener("click", () => {
        selectCategoria.classList.toggle("d-none");
    });

    fetch(`http://localhost:8080/api/detalles_viajes/${detalleId}`)
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener detalles del viaje");
            return res.json();
        })
        .then(data => {
            idViaje = data.viaje?.id;

            return Promise.all([
                fetch("http://localhost:8080/api/categorias").then(res => res.json()),
                Promise.resolve(data.viaje?.categoria?.id)
            ]);
        })
        .then(([categorias, categoriaActual]) => {
            categorias.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.name;
                selectCategoria.appendChild(option);
            });
            if (categoriaActual) {
                selectCategoria.value = categoriaActual;
            }
        })
        .catch(err => console.error("Error cargando categorías o viaje:", err));

    // Guardar categoría en BBDD al seleccionar la categoria que queramos
    selectCategoria.addEventListener("change", () => {
        if (!idViaje) return;
        const nuevaCategoriaId = selectCategoria.value;

        fetch(`http://localhost:8080/viajes/${idViaje}/categoria`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoria_id: parseInt(nuevaCategoriaId) })
        })
            .then(res => {
                if (res.ok) {
                    console.log("Categoría actualizada");
                    selectCategoria.classList.add("d-none");
                } else {
                    console.error("Error al actualizar la categoría");
                }
            })
            .catch(err => console.error("Error de red al actualizar categoría:", err));
    });



// Parte que permite el logout de un usuario
    document.getElementById("logout").addEventListener("click", function () {
           localStorage.removeItem("token");
           localStorage.removeItem("usuario");
           window.location.href = "index.html";
    });
});
