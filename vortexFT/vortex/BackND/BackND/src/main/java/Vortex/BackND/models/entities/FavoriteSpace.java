package Vortex.BackND.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "favorite_spaces")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteSpace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "github_user_id", nullable = false)
    private String githubUserId; // Identifica al usuario que marcó el favorito

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;
}