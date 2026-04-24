package Vortex.BackND.models.entities;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "board_columns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false) 
    private String keyword; 

    private String color;

    @Column(name = "is_done_column")
    private Boolean isDoneColumn;

    @Column(name = "position_index")
    private Integer position = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false) 
    @JsonIgnore 
    private Workspace workspace;

    @OneToMany(mappedBy = "column", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC, id ASC")
    private java.util.List<IssueCard> cards;
    
}
