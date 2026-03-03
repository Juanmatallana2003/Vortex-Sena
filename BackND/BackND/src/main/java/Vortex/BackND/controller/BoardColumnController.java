package Vortex.BackND.controller;
import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.services.BoardColumnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/columns")
@CrossOrigin("*")
public class BoardColumnController {

    private final BoardColumnService columnService;

    public BoardColumnController(BoardColumnService columnService) {

        this.columnService = columnService;
    }

    @PostMapping
    public ResponseEntity<BoardColumn> createColumn(
            @PathVariable UUID workspaceId,
            @RequestBody BoardColumn newColumn) {
        
        BoardColumn savedColumn = columnService.createColumnForWorkspace(workspaceId, newColumn);
        return ResponseEntity.ok(savedColumn);
    }
}