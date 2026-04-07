package Vortex.BackND.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "tags")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardTag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String label; // Ejemplo: "bug", "feature"

    @Column(nullable = false)
    private String color; // Ejemplo: "red", "blue"

    private String icon; // Opcional (ej: "fa-solid fa-bug")
}