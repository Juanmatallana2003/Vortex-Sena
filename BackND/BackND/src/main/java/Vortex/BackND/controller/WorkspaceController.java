package Vortex.BackND.controller;

import Vortex.BackND.models.entities.Workspace;
import Vortex.BackND.services.WorkspaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController 
@RequestMapping("/api/workspaces") 
@CrossOrigin("*")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {

        this.workspaceService = workspaceService;
    }

    @PostMapping
    public ResponseEntity<Workspace> create(@RequestBody Workspace workspace) {

        Workspace newWorkspace = workspaceService.createWorkspace(workspace);
        return ResponseEntity.ok(newWorkspace);
    }

    @GetMapping
    public ResponseEntity<List<Workspace>> getAll() {

        return ResponseEntity.ok(workspaceService.getAllWorkspaces());
    }
}