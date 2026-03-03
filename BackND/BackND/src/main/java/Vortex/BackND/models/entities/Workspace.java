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

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<BoardColumn> columns;

}