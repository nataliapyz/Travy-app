package com.example.diario_viajes.model;
import jakarta.persistence.*;

@Entity
@Table(name = "detalles_viajes")
public class DetallesViaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "viaje_id", nullable = false)
    private Viaje viaje;

    @Column(columnDefinition = "TEXT")
    private String diario;
    @Column(columnDefinition = "TEXT")
    private String checklist;
    @Column(columnDefinition = "TEXT")
    private String presupuesto;
    @Column(columnDefinition = "JSON")
    private String fotos;
    @Column(name = "mapa_foto", columnDefinition = "VARCHAR(255)")
    private String mapaFoto;

    public DetallesViaje() {}
    public DetallesViaje(Viaje viaje, String diario, String checklist, String presupuesto, String fotos, String mapaFoto) {
        this.viaje = viaje;
        this.diario = diario;
        this.checklist = checklist;
        this.presupuesto = presupuesto;
        this.fotos = fotos;
        this.mapaFoto = mapaFoto;
    }


    //getters y setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Viaje getViaje() { return viaje; }
    public void setViaje(Viaje viaje) { this.viaje = viaje; }

     public String getDiario() { return diario; }
    public void setDiario(String diario) { this.diario = diario; }

    public String getChecklist() { return checklist; }
    public void setChecklist(String checklist) { this.checklist = checklist; }

    public String getPresupuesto() { return presupuesto; }
    public void setPresupuesto(String presupuesto) { this.presupuesto = presupuesto; }

    public String getFotos() { return fotos; }
    public void setFotos(String fotos) { this.fotos = fotos; }

    public String getMapaFoto() { return mapaFoto; }
    public void setMapaFoto(String mapaFoto) { this.mapaFoto = mapaFoto; }

}
