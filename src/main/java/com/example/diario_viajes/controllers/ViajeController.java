package com.example.diario_viajes.controllers;
import com.example.diario_viajes.model.Viaje;
import com.example.diario_viajes.model.CategoriaViaje;
import com.example.diario_viajes.repository.CategoriaViajeRepository;
import com.example.diario_viajes.repository.ViajeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/viajes")
@CrossOrigin(origins = "*")
public class ViajeController {

    @Autowired
    private ViajeRepository viajeRepository;
    @Autowired
    private CategoriaViajeRepository categoriaViajeRepository;



    // Obtener todos los viajes
    @GetMapping
    public List<Viaje> obtenerTodosLosViajes() {
        return viajeRepository.findAll();
    }
    // Obtener un  viaje por ID
    @GetMapping("/{id}")
    public ResponseEntity<Viaje> obtenerViajePorId(@PathVariable Integer id) {
        return viajeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    //  Crear un nuevo viaje
    @PostMapping
    public Viaje crearViaje(@RequestBody Viaje viaje) {
        return viajeRepository.save(viaje);
    }
    // Actualizar  un viaje
    @PutMapping("/{id}")
    public ResponseEntity<Viaje> actualizarViaje(@PathVariable Integer id, @RequestBody Viaje viajeActualizado) {
        return viajeRepository.findById(id).map(viaje -> {
            viaje.setTitulo(viajeActualizado.getTitulo());
            viaje.setFecha(viajeActualizado.getFecha());
            viaje.setCategoria(viajeActualizado.getCategoria());
            return ResponseEntity.ok(viajeRepository.save(viaje));
        }).orElse(ResponseEntity.notFound().build());
    }
    //Eliminar un viaje
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarViaje(@PathVariable Integer id) {
        if (viajeRepository.existsById(id)) {
            viajeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    //Subir una imagen a la carpeta "Subidas"
    @PostMapping("/{id}/imagen")
    public ResponseEntity<String> subirImagen(@PathVariable Integer id, @RequestParam("imagen") MultipartFile imagen) {
        try {
            Optional<Viaje> viajeOptional = viajeRepository.findById(id);
            if (viajeOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String nombreArchivo = UUID.randomUUID() + "_" + imagen.getOriginalFilename().replaceAll("\\s+", "_");
            String directorio = System.getProperty("user.dir") + File.separator + "subidas";
            Files.createDirectories(Paths.get(directorio));
            Path rutaDestino = Paths.get(directorio, nombreArchivo);

            imagen.transferTo(rutaDestino.toFile());

            Viaje viaje = viajeOptional.get();
            viaje.setImagenPortada(nombreArchivo);
            viajeRepository.save(viaje);

            return ResponseEntity.ok(nombreArchivo);


        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al guardar la imagen ");
        }
    }
    //actualizar categoria
    @PutMapping("/{id}/categoria")
    public ResponseEntity<?> actualizarCategoria(@PathVariable Integer id, @RequestBody Map<String, Integer> datos) {
        Integer categoriaId = datos.get("categoria_id");
        System.out.println("ID del viaje recibido: " + id);
        System.out.println("ID de categoría recibido: " + categoriaId);

        Optional<Viaje> viajeOpt = viajeRepository.findById(id);
        Optional<CategoriaViaje> categoriaOpt = categoriaViajeRepository.findById(categoriaId);

        if (viajeOpt.isEmpty()) {
            System.out.println("Viaje no encontrado");
            return ResponseEntity.notFound().build();
        }

        if (categoriaOpt.isEmpty()) {
            System.out.println("Categoría no encontrada");
            return ResponseEntity.notFound().build();
        }


        Viaje viaje = viajeOpt.get();
        CategoriaViaje categoria = categoriaOpt.get();

        System.out.println("Actualizando viaje ");
        viaje.setCategoria(categoria);
        viajeRepository.save(viaje);
        System.out.println("Categoría actualizada correctamente");

        return ResponseEntity.ok().build();
    }

    //Esto es lo que filtra que un usuario solo pueda ver sus viajes guardados
    @GetMapping("/usuario/{usuarioId}")
    public List<Viaje> obtenerViajesPorUsuario(@PathVariable Integer usuarioId) {
        return viajeRepository.findByUsuarioId(usuarioId);
    }

}
