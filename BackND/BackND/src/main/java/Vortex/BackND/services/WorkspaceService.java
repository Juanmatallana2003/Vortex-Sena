package Vortex.BackND.services;

import Vortex.BackND.models.entities.Workspace;
import Vortex.BackND.repositories.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository) {

        this.workspaceRepository = workspaceRepository;
    }

    public Workspace createWorkspace(Workspace workspace) {

        return workspaceRepository.save(workspace); 
    }

    public List<Workspace> getAllWorkspaces() {
        
        return workspaceRepository.findAll();
    }
}