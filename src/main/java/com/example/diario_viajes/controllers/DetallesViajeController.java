package com.example.diario_viajes.controllers;
import com.example.diario_viajes.model.DetallesViaje;
import com.example.diario_viajes.repository.DetallesViajeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;



@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/detalles_viajes")
public class DetallesViajeController {
    @Autowired
    private DetallesViajeRepository detallesViajeRepository;

    //Obtiene todos los detalles de viajes
    @GetMapping
    public List<DetallesViaje> getAllDetallesViajes() {
        return detallesViajeRepository.findAll();
    }
    //detalle de viaje por ID
    @GetMapping("/{id}")
    public ResponseEntity<DetallesViaje> getDetallesViajeById(@PathVariable int id) {
        Optional<DetallesViaje> detallesViaje = detallesViajeRepository.findById(id);
        return detallesViaje.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @GetMapping("/byViajeId/{viajeId}")
    public ResponseEntity<DetallesViaje> getByViajeId(@PathVariable int viajeId) {
        return detallesViajeRepository.findByViajeId(viajeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //Crear un nuevo detalle de viaje
    @PostMapping
    public ResponseEntity<DetallesViaje> createDetallesViaje(@RequestBody DetallesViaje detallesViaje) {
        DetallesViaje newDetallesViaje = detallesViajeRepository.save(detallesViaje);
        return ResponseEntity.ok(newDetallesViaje);
    }
    //Actualizar un detalle de viaje completo
    @PutMapping("/{id}")
    public ResponseEntity<DetallesViaje> updateDetallesViaje(@PathVariable int id, @RequestBody DetallesViaje detallesViajeDetails) {
        return detallesViajeRepository.findById(id)
                .map(detallesViaje -> {
                    detallesViaje.setDiario(detallesViajeDetails.getDiario());
                    detallesViaje.setChecklist(detallesViajeDetails.getChecklist());
                    detallesViaje.setPresupuesto(detallesViajeDetails.getPresupuesto());
                    detallesViaje.setFotos(detallesViajeDetails.getFotos());
                    detallesViaje.setMapaFoto(detallesViajeDetails.getMapaFoto());
                    detallesViajeRepository.save(detallesViaje);
                    return ResponseEntity.ok(detallesViaje);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    //Actualizar SOLO el checklist
    @PutMapping("/{id}/checklist")
    public ResponseEntity<DetallesViaje> actualizarChecklist(@PathVariable int id, @RequestBody String checklistJson) {
        return detallesViajeRepository.findById(id)
                .map(detallesViaje -> {
                    detallesViaje.setChecklist(checklistJson);
                    detallesViajeRepository.save(detallesViaje);
                    return ResponseEntity.ok(detallesViaje);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    //Actualizar SOLO el diario
    @PutMapping("/{id}/diario")
    public ResponseEntity<DetallesViaje> actualizarDiario(@PathVariable int id, @RequestBody String diarioJson) {
        return detallesViajeRepository.findById(id)
                .map(detallesViaje -> {
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        String textoDiario = mapper.readTree(diarioJson).get("diario").asText();
                        detallesViaje.setDiario(textoDiario);
                        detallesViajeRepository.save(detallesViaje);
                        return ResponseEntity.ok(detallesViaje);
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().<DetallesViaje>build();
                    }
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
//    Poder subir varias fotos a la vez en VISUAL
    @PostMapping("/{id}/fotos")
    public ResponseEntity<List<String>> subirFotos(
            @PathVariable int id,
            @RequestParam("foto") List<MultipartFile> fotosSubidas) {
        Optional<DetallesViaje> detallesOpt = detallesViajeRepository.findById(id);
        if (detallesOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DetallesViaje detalles = detallesOpt.get();
        String carpetaDestino = System.getProperty("user.dir") + File.separator + "Subidas";
        File carpeta = new File(carpetaDestino);
        if (!carpeta.exists()) carpeta.mkdirs();

        List<String> fotos = new ArrayList<>();
        try {
            String json = detalles.getFotos();
            if (json != null && !json.isBlank()) {
                fotos = new ObjectMapper().readValue(json, List.class);
            }
        } catch (IOException e) {
            e.printStackTrace(); // continuar con lista vacía
        }


        for (MultipartFile foto : fotosSubidas) {
            if (!foto.isEmpty()) {
                String nombreArchivo = System.currentTimeMillis() + "_" + Objects.requireNonNull(foto.getOriginalFilename()).replaceAll("\\s+", "_");
                File destino = new File(carpetaDestino + File.separator + nombreArchivo);


                try {
                    foto.transferTo(destino);
                    fotos.add("/Subidas/" + nombreArchivo);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }


        try {
            detalles.setFotos(new ObjectMapper().writeValueAsString(fotos));
            detallesViajeRepository.save(detalles);
            return ResponseEntity.ok(fotos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }
//  Eliminar fotos de la parte "Visual"
@DeleteMapping("/{id}/fotos")
public ResponseEntity<List<String>> eliminarFoto(
        @PathVariable int id,
        @RequestBody Map<String, String> body) {

    String fotoAEliminar = body.get("foto");
    if (fotoAEliminar == null || fotoAEliminar.isBlank()) {
        return ResponseEntity.badRequest().build();
    }
    Optional<DetallesViaje> detallesOpt = detallesViajeRepository.findById(id);
    if (detallesOpt.isEmpty()) return ResponseEntity.notFound().build();

    DetallesViaje detalles = detallesOpt.get();
    List<String> fotos = new ArrayList<>();
    try {
        String json = detalles.getFotos();
        if (json != null && !json.isBlank()) {
            fotos = new ObjectMapper().readValue(json, List.class);
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
    // Eliminar la foto
    fotos.removeIf(f -> f.equals(fotoAEliminar));

    try {
        detalles.setFotos(new ObjectMapper().writeValueAsString(fotos));
        detallesViajeRepository.save(detalles);
        return ResponseEntity.ok(fotos);
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}
    // Subir imagen de mapa y actualizar campo 'mapa_foto'
    @PostMapping("/{id}/mapa")
    public ResponseEntity<String> subirImagenMapa(@PathVariable Integer id, @RequestParam("imagen") MultipartFile imagen) {
        try {
            Optional<DetallesViaje> detallesOptional = detallesViajeRepository.findById(id);
            if (detallesOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String nombreArchivo = UUID.randomUUID() + "_" + imagen.getOriginalFilename().replaceAll("\\s+", "_");

            String directorio = System.getProperty("user.dir") + File.separator + "subidas";
            Files.createDirectories(Paths.get(directorio));
            Path rutaDestino = Paths.get(directorio, nombreArchivo);
            imagen.transferTo(rutaDestino.toFile());

            DetallesViaje detalles = detallesOptional.get();
            detalles.setMapaFoto(nombreArchivo);
            detallesViajeRepository.save(detalles);

            return ResponseEntity.ok(nombreArchivo);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al guardar la imagen del mapa");
        }
    }
    //ACTUALIZAR EL PRESUPUESTO
    @PutMapping("/{id}/presupuesto")
    public ResponseEntity<DetallesViaje> actualizarPresupuesto(@PathVariable int id, @RequestBody String presupuestoJson) {
        return detallesViajeRepository.findById(id)
                .map(detallesViaje -> {
                    detallesViaje.setPresupuesto(presupuestoJson);
                    detallesViajeRepository.save(detallesViaje);
                    return ResponseEntity.ok(detallesViaje);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //Eliminar un detalle de viaje por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDetallesViaje(@PathVariable int id) {
        if (detallesViajeRepository.existsById(id)) {
            detallesViajeRepository.deleteById(id);
            return ResponseEntity.ok("Detalles de viaje eliminados con éxito.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    //Eliminar detalles de viaje por viajeId
    @DeleteMapping("/byViajeId/{viajeId}")
    public ResponseEntity<String> deleteByViajeId(@PathVariable int viajeId) {
        Optional<DetallesViaje> detallesOpt = detallesViajeRepository.findByViajeId(viajeId);
        if (detallesOpt.isPresent()) {
            detallesViajeRepository.delete(detallesOpt.get());
            return ResponseEntity.ok("Detalles eliminados correctamente");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

