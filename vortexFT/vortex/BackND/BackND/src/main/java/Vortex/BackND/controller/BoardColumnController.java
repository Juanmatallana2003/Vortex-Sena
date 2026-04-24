package Vortex.BackND.controller;

import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.services.BoardColumnService;
import Vortex.BackND.repositories.BoardColumnRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BoardColumnController {

    private final BoardColumnService columnService;
    private final BoardColumnRepository columnRepository; // Inyección requerida para editar

    public BoardColumnController(BoardColumnService columnService, BoardColumnRepository columnRepository) {
        this.columnService = columnService;
        this.columnRepository = columnRepository;
    }

    // Recibimos el ID del workspace de la URL y la data por el Body JSON
    @PostMapping("/workspaces/{workspaceId}/columns")
    public ResponseEntity<BoardColumn> createColumn(
            @PathVariable UUID workspaceId,
            @RequestBody BoardColumn newColumn) {
        
        BoardColumn savedColumn = columnService.createColumnForWorkspace(workspaceId, newColumn);
        return ResponseEntity.ok(savedColumn);
    }

    // Endpoint para editar el título y color de una columna existente
    @PutMapping("/columns/{columnId}")
    public ResponseEntity<BoardColumn> updateColumn(
            @PathVariable UUID columnId,
            @RequestBody BoardColumn updatedData) {
        
        BoardColumn existingColumn = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Columna no encontrada"));
        
        existingColumn.setTitle(updatedData.getTitle());
        existingColumn.setColor(updatedData.getColor());
        // No actualizamos el keyword para no romper los webhooks existentes
        
        BoardColumn savedColumn = columnRepository.save(existingColumn);
        return ResponseEntity.ok(savedColumn);
    }
}