package com.example.diario_viajes.repository;
import com.example.diario_viajes.model.Viaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ViajeRepository extends JpaRepository<Viaje, Integer> {
    List<Viaje> findByUsuarioId(Integer usuarioId);
}

