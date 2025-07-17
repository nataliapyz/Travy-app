package com.example.diario_viajes.controllers;
import com.example.diario_viajes.model.CategoriaViaje;
import com.example.diario_viajes.repository.CategoriaViajeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/categorias")
public class CategoriaViajeController {
    @Autowired
    private CategoriaViajeRepository categoriaViajeRepository;

    @GetMapping
    public List<CategoriaViaje> getAllCategorias() {
        return categoriaViajeRepository.findAll();
    }

    @PostMapping
    public CategoriaViaje createCategoria(@RequestBody CategoriaViaje categoria) {
        return categoriaViajeRepository.save(categoria);
    }
}
