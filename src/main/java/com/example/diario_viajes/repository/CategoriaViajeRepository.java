package com.example.diario_viajes.repository;
import com.example.diario_viajes.model.CategoriaViaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CategoriaViajeRepository extends JpaRepository<CategoriaViaje, Integer> {
}
