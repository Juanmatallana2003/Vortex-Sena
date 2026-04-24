package Vortex.BackND.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "issue_cards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "issue_number")
    private Integer issueNumber;

    private String title;
    
    @Column(length = 2000) // Ampliado para descripciones más largas
    private String description;

    // ======== ⚡ NUEVOS CAMPOS AÑADIDOS ========
    
    @Column(name = "due_date")
    private String dueDate; // Guardaremos la fecha en formato YYYY-MM-DD

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "position_index")
    private Integer position = 0;

    // Lista de avatares/nombres de los asignados guardada como un arreglo simple en BD
    @ElementCollection
    @CollectionTable(name = "issue_assignees", joinColumns = @JoinColumn(name = "card_id"))
    @Column(name = "assignee_url")
    private List<String> assignees;

    // Relación Mucho-a-Muchos para los Tags (Etiquetas de colores)
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "card_tags",
        joinColumns = @JoinColumn(name = "card_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<CardTag> tags;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "column_id", nullable = false)
    @JsonIgnore
    private BoardColumn column;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
