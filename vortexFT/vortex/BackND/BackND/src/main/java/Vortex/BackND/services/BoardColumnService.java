package Vortex.BackND.services;

import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.models.entities.Workspace;
import Vortex.BackND.repositories.BoardColumnRepository;
import Vortex.BackND.repositories.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class BoardColumnService {

    private final BoardColumnRepository columnRepository;
    private final WorkspaceRepository workspaceRepository;

    public BoardColumnService(BoardColumnRepository columnRepository, WorkspaceRepository workspaceRepository) {
        
        this.columnRepository = columnRepository;
        this.workspaceRepository = workspaceRepository;
    }

    public BoardColumn createColumnForWorkspace(UUID workspaceId, BoardColumn newColumn) {

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("No se encontró el Workspace con ese ID"));

        newColumn.setWorkspace(workspace);
        return columnRepository.save(newColumn);
    }
}