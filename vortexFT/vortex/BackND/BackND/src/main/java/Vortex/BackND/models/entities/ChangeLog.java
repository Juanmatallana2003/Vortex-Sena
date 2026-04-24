package Vortex.BackND.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "change_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String type; // 'manual' o 'automatic'

    @Column(nullable = false)
    private String description;

    @Column(length = 1000)
    private String details;

    @Column(name = "card_id")
    private String cardId;

    // Datos del usuario que hizo la acción (o del bot)
    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_avatar")
    private String userAvatar;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    // Cada log pertenece a un Workspace específico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    @JsonIgnore
    private Workspace workspace;
}