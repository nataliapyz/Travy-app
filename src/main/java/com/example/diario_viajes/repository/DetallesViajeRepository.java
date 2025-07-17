package com.example.diario_viajes.repository;
import com.example.diario_viajes.model.DetallesViaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;



@Repository
public interface DetallesViajeRepository extends JpaRepository<DetallesViaje, Integer> {
    Optional<DetallesViaje> findByViajeId(int viajeId);
}

