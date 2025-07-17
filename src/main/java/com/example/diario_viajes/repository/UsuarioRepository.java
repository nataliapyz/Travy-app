package com.example.diario_viajes.repository;
import com.example.diario_viajes.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Usuario findByEmailAndPassword(String email, String password);
    Optional<Usuario> findByName(String name); //aquí falta lo que viene siendo el tema de que busque por ID
}



