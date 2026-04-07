package Vortex.BackND.controller;

import Vortex.BackND.models.entities.Workspace;
import Vortex.BackND.models.entities.WorkspaceMember;
import Vortex.BackND.repositories.WorkspaceRepository;
import Vortex.BackND.repositories.WorkspaceMemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Vortex.BackND.models.entities.ChangeLog;
import Vortex.BackND.repositories.ChangeLogRepository;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository; // Inyectamos el nuevo repo
    private final ChangeLogRepository changeLogRepository; // Inyectamos el repo de logs

    public WorkspaceController(WorkspaceRepository workspaceRepository,
         WorkspaceMemberRepository memberRepository,
         ChangeLogRepository changeLogRepository) {

        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.changeLogRepository = changeLogRepository; // Aseguramos que el repo de logs también esté disponible
    }

    @PostMapping
    public ResponseEntity<Workspace> create(@RequestBody Workspace workspace) {
        return ResponseEntity.ok(workspaceRepository.save(workspace));
    }

    @GetMapping
    public ResponseEntity<List<Workspace>> getAll() {
        return ResponseEntity.ok(workspaceRepository.findAll());
    }

    @PutMapping("/{workspaceId}")
    public ResponseEntity<Workspace> updateWorkspace(@PathVariable UUID workspaceId, @RequestBody Workspace updatedData) {
        Workspace existingWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado"));
        existingWorkspace.setName(updatedData.getName());
        existingWorkspace.setRepoUrl(updatedData.getRepoUrl());
        existingWorkspace.setDefaultBranch(updatedData.getDefaultBranch());
        return ResponseEntity.ok(workspaceRepository.save(existingWorkspace));
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable UUID workspaceId) {
        Workspace existingWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado"));
        workspaceRepository.delete(existingWorkspace);
        return ResponseEntity.noContent().build();
    }

    // ======== ⚡ ACTUALIZADO: GUARDA MIEMBROS EN POSTGRESQL ========
    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<WorkspaceMember> inviteMemberToWorkspace(
            @PathVariable UUID workspaceId,
            @RequestBody java.util.Map<String, String> payload) {
        
        String inputData = payload.get("input");
        String inviteType = payload.get("type"); // "email" o "github"
        String avatarData = payload.get("avatar"); // Nuevo campo que enviará React

        Workspace existingWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado"));
        
        WorkspaceMember newMember = new WorkspaceMember();
        newMember.setWorkspace(existingWorkspace);
        newMember.setAvatarUrl(avatarData);

        if ("github".equals(inviteType)) {
            newMember.setName(inputData);
            newMember.setUsername("@" + inputData);
            newMember.setEmail("Cuenta GitHub");
        } else {
            newMember.setName("Usuario Correo");
            newMember.setUsername("Pendiente");
            newMember.setEmail(inputData);
        }

        WorkspaceMember savedMember = memberRepository.save(newMember);
        return ResponseEntity.ok(savedMember);
    }

    // ======== ⚡ NUEVO: OBTENER HISTORIAL (AUDITORÍA) ========
    @GetMapping("/{workspaceId}/history")
    public ResponseEntity<List<ChangeLog>> getWorkspaceHistory(@PathVariable UUID workspaceId) {
        try {
            List<ChangeLog> logs = changeLogRepository.findByWorkspaceIdOrderByTimestampDesc(workspaceId);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    // ======== ⚡ NUEVO: GUARDAR EVENTO EN HISTORIAL ========
    @PostMapping("/{workspaceId}/history")
    public ResponseEntity<ChangeLog> createHistoryLog(
            @PathVariable UUID workspaceId,
            @RequestBody ChangeLog newLog) {
        
        Workspace existingWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado"));
        
        newLog.setWorkspace(existingWorkspace);
        ChangeLog savedLog = changeLogRepository.save(newLog);
        
        return ResponseEntity.ok(savedLog);
    }
}