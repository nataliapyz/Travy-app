package com.example.diario_viajes.model;
import jakarta.persistence.*;


@Entity
@Table(name = "categorias_viajes")
public class CategoriaViaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "name", unique = true, nullable = false, length = 50)
    private String name;


    public CategoriaViaje() {}
    public CategoriaViaje(String name) {
        this.name = name;
    }

    // Getters y Setters del modelo
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

     public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
