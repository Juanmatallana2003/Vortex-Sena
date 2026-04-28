package Vortex.BackND.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "workspaces")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String icon;

    @Column(name = "repo_url")
    private String repoUrl;

    @Column(name = "default_branch")
    private String defaultBranch;

    // 1 Espacio de Trabajo puede tener MUCHAS columnas (Lista)
    // El "cascade" hace que si borramos un workspace, se borren también sus columnas de forma segura.
    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC, id ASC") // Orden visual estable de izquierda a derecha segun posicion.
    private java.util.List<BoardColumn> columns;

    // 1 Espacio puede tener MUCHOS miembros
    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<WorkspaceMember> members;

}