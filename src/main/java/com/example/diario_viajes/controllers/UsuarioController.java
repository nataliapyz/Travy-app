package com.example.diario_viajes.controllers;
import com.example.diario_viajes.model.Usuario;
import com.example.diario_viajes.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:63342")
@RestController
@RequestMapping("/api/usuarios") //Establece la ruta base del controlador, por lo que los métodos que le pongamos aquí, se verán en esa ruta. Solo puede haber UN REQUEST MAPPING POR CLASE
public class UsuarioController {
    @Autowired //Esto le dice a Spring que inyecte automáticamente una instancia del repositorio para acceder a la base de datos. Por buenas prácticas lo mejor es poner el mismo nombre
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable int id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        return usuario.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    //perfil del usuario logueado por su ID
    @GetMapping("/perfil")
    public ResponseEntity<Usuario> obtenerPerfil(@RequestParam Integer id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        return usuario.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    //usuario por NOMBRE
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<Usuario> obtenerPorNombre(@PathVariable String nombre) {
        return usuarioRepository.findByName(nombre)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    //Crear un nuevo usuario
    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) {
        Usuario newUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(newUsuario);
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginRequest) {
        Usuario usuario = usuarioRepository.findByEmailAndPassword(loginRequest.getEmail(), loginRequest.getPassword());

        if (usuario != null) {
            return ResponseEntity.ok(usuario); // Devuelve el usuario autenticado
        } else {
            return ResponseEntity.status(401).body("Usuario o contraseña incorrectos");
        }
    }
    //Actualizar un usuario existente
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable int id, @RequestBody Usuario usuarioDetails) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setName(usuarioDetails.getName());
                    usuario.setEmail(usuarioDetails.getEmail());
                    usuario.setPassword(usuarioDetails.getPassword());
                    usuarioRepository.save(usuario);
                    return ResponseEntity.ok(usuario);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //Eliminar un usuario por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUsuario(@PathVariable int id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.ok("Usuario eliminado con éxito.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
