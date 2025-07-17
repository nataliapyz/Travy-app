package com.example.diario_viajes.model;
import jakarta.persistence.*;

@Entity
@Table(name = "viajes")
public class Viaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String titulo;
    @Column(nullable = false)
    private Integer fecha;
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private CategoriaViaje categoria;
    @Column(nullable = true)
    private String imagenPortada;

    public Viaje() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public Integer getFecha() { return fecha; }
    public void setFecha(Integer fecha) { this.fecha = fecha; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public CategoriaViaje getCategoria() { return categoria; }
    public void setCategoria(CategoriaViaje categoria) { this.categoria = categoria; }

    public String getImagenPortada() { return imagenPortada; }
    public void setImagenPortada(String imagenPortada) { this.imagenPortada = imagenPortada; }
}
