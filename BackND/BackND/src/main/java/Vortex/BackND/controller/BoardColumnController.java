package Vortex.BackND.controller;

import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.repositories.BoardColumnRepository;
import Vortex.BackND.services.BoardColumnService;
import Vortex.BackND.services.NotificationService;
import Vortex.BackND.services.RealtimeEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BoardColumnController {

    private final BoardColumnService columnService;
    private final BoardColumnRepository columnRepository;
    private final RealtimeEventService realtimeEventService;
    private final NotificationService notificationService;

    public BoardColumnController(BoardColumnService columnService,
                                 BoardColumnRepository columnRepository,
                                 RealtimeEventService realtimeEventService,
                                 NotificationService notificationService) {
        this.columnService = columnService;
        this.columnRepository = columnRepository;
        this.realtimeEventService = realtimeEventService;
        this.notificationService = notificationService;
    }

    @PostMapping("/workspaces/{workspaceId}/columns")
    public ResponseEntity<BoardColumn> createColumn(
            @PathVariable UUID workspaceId,
            @RequestBody BoardColumn newColumn) {
        BoardColumn savedColumn = columnService.createColumnForWorkspace(workspaceId, newColumn);
        realtimeEventService.publishToAll("column_created", workspaceId.toString(), savedColumn.getId().toString());
        return ResponseEntity.ok(savedColumn);
    }

    @PutMapping("/columns/{columnId}")
    public ResponseEntity<BoardColumn> updateColumn(
            @PathVariable UUID columnId,
            @RequestBody BoardColumn updatedData) {

        BoardColumn existingColumn = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Columna no encontrada"));

        existingColumn.setTitle(updatedData.getTitle());
        existingColumn.setColor(updatedData.getColor());

        if (updatedData.getKeyword() != null && !updatedData.getKeyword().isBlank()) {
            existingColumn.setKeyword(updatedData.getKeyword());
        }
        if (updatedData.getIsDoneColumn() != null) {
            existingColumn.setIsDoneColumn(updatedData.getIsDoneColumn());
        }

        BoardColumn savedColumn = columnRepository.save(existingColumn);
        realtimeEventService.publishToAll(
                "column_updated",
                savedColumn.getWorkspace().getId().toString(),
                savedColumn.getId().toString()
        );

        return ResponseEntity.ok(savedColumn);
    }

    @DeleteMapping("/columns/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable UUID columnId,
                                             @AuthenticationPrincipal OAuth2User user) {
        BoardColumn existingColumn = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Columna no encontrada"));

        UUID workspaceId = existingColumn.getWorkspace().getId();
        String columnTitle = existingColumn.getTitle();
        columnRepository.delete(existingColumn);

        realtimeEventService.publishToAll("column_deleted", workspaceId.toString(), columnId.toString());
        notificationService.notifyColumnDeleted(workspaceId, columnTitle, resolveActorLogin(user));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/workspaces/{workspaceId}/columns/reorder")
    public ResponseEntity<Void> reorderColumns(
            @PathVariable UUID workspaceId,
            @RequestBody List<UUID> orderedColumnIds) {
        for (int i = 0; i < orderedColumnIds.size(); i++) {
            UUID colId = orderedColumnIds.get(i);
            BoardColumn column = columnRepository.findById(colId).orElse(null);
            if (column != null && column.getWorkspace().getId().equals(workspaceId)) {
                column.setPosition(i);
                columnRepository.save(column);
            }
        }

        realtimeEventService.publishToAll("columns_reordered", workspaceId.toString(), null);
        return ResponseEntity.ok().build();
    }

    private String resolveActorLogin(OAuth2User user) {
        if (user == null) {
            return "vortex-user";
        }
        String login = user.getAttribute("login");
        if (login != null && !login.isBlank()) {
            return login;
        }
        String fallbackName = user.getName();
        return (fallbackName == null || fallbackName.isBlank()) ? "vortex-user" : fallbackName;
    }
}
