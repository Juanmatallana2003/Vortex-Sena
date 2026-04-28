package Vortex.BackND.controller;

import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.models.entities.ChangeLog;
import Vortex.BackND.models.entities.Workspace;
import Vortex.BackND.models.entities.WorkspaceMember;
import Vortex.BackND.repositories.BoardColumnRepository;
import Vortex.BackND.repositories.ChangeLogRepository;
import Vortex.BackND.repositories.FavoriteSpaceRepository;
import Vortex.BackND.repositories.WorkspaceMemberRepository;
import Vortex.BackND.repositories.WorkspaceRepository;
import Vortex.BackND.services.NotificationService;
import Vortex.BackND.services.RealtimeEventService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final ChangeLogRepository changeLogRepository;
    private final FavoriteSpaceRepository favoriteSpaceRepository;
    private final BoardColumnRepository columnRepository;
    private final RealtimeEventService realtimeEventService;
    private final NotificationService notificationService;

    public WorkspaceController(WorkspaceRepository workspaceRepository,
                               WorkspaceMemberRepository memberRepository,
                               ChangeLogRepository changeLogRepository,
                               FavoriteSpaceRepository favoriteSpaceRepository,
                               BoardColumnRepository columnRepository,
                               RealtimeEventService realtimeEventService,
                               NotificationService notificationService) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.changeLogRepository = changeLogRepository;
        this.favoriteSpaceRepository = favoriteSpaceRepository;
        this.columnRepository = columnRepository;
        this.realtimeEventService = realtimeEventService;
        this.notificationService = notificationService;
    }

    @Transactional
    @PostMapping
    public ResponseEntity<Workspace> create(@RequestBody Workspace workspace) {
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        BoardColumn todo = new BoardColumn();
        todo.setTitle("Por Hacer");
        todo.setKeyword("todo");
        todo.setColor("bg-red-400");
        todo.setIsDoneColumn(false);
        todo.setPosition(0);
        todo.setWorkspace(savedWorkspace);

        BoardColumn inProgress = new BoardColumn();
        inProgress.setTitle("En Proceso");
        inProgress.setKeyword("wip");
        inProgress.setColor("bg-yellow-400");
        inProgress.setIsDoneColumn(false);
        inProgress.setPosition(1);
        inProgress.setWorkspace(savedWorkspace);

        BoardColumn done = new BoardColumn();
        done.setTitle("Terminadas");
        done.setKeyword("done");
        done.setColor("bg-green-400");
        done.setIsDoneColumn(true);
        done.setPosition(2);
        done.setWorkspace(savedWorkspace);

        columnRepository.saveAll(List.of(todo, inProgress, done));

        realtimeEventService.publishToAll("workspace_created", savedWorkspace.getId().toString(), null);
        return ResponseEntity.ok(savedWorkspace);
    }

    @GetMapping
    public ResponseEntity<List<Workspace>> getAll() {
        return ResponseEntity.ok(workspaceRepository.findAll());
    }

    @PutMapping("/{workspaceId}")
    public ResponseEntity<Workspace> updateWorkspace(@PathVariable UUID workspaceId, @RequestBody Workspace updatedData) {
        Workspace existingWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));

        existingWorkspace.setName(updatedData.getName());
        existingWorkspace.setRepoUrl(updatedData.getRepoUrl());
        existingWorkspace.setDefaultBranch(updatedData.getDefaultBranch());

        Workspace savedWorkspace = workspaceRepository.save(existingWorkspace);
        realtimeEventService.publishToAll("workspace_updated", workspaceId.toString(), null);

        return ResponseEntity.ok(savedWorkspace);
    }

    @Transactional
    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable UUID workspaceId) {
        Workspace existingWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));

        try {
            favoriteSpaceRepository.deleteByWorkspaceId(workspaceId);
            changeLogRepository.deleteByWorkspaceId(workspaceId);
            workspaceRepository.delete(existingWorkspace);
            workspaceRepository.flush();

            realtimeEventService.publishToAll("workspace_deleted", workspaceId.toString(), null);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se pudo eliminar el espacio por restricciones de integridad", ex);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error interno al eliminar el espacio", ex);
        }
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<WorkspaceMember> inviteMemberToWorkspace(@PathVariable UUID workspaceId,
                                                                   @RequestBody Map<String, String> payload,
                                                                   @AuthenticationPrincipal OAuth2User user) {
        Workspace existingWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));

        WorkspaceMember newMember = new WorkspaceMember();
        newMember.setWorkspace(existingWorkspace);
        newMember.setAvatarUrl(payload.get("avatar"));

        if ("github".equals(payload.get("type"))) {
            newMember.setName(payload.get("input"));
            newMember.setUsername("@" + payload.get("input"));
            newMember.setEmail("Cuenta GitHub");
        } else {
            newMember.setName("Usuario Correo");
            newMember.setUsername("Pendiente");
            newMember.setEmail(payload.get("input"));
        }

        WorkspaceMember savedMember = memberRepository.save(newMember);
        realtimeEventService.publishToAll("workspace_member_invited", workspaceId.toString(), savedMember.getId().toString());
        if ("github".equals(payload.get("type"))) {
            notificationService.notifyWorkspaceMemberInvited(existingWorkspace, savedMember, resolveActorLogin(user));
        }

        return ResponseEntity.ok(savedMember);
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

    @GetMapping("/{workspaceId}/history")
    public ResponseEntity<List<ChangeLog>> getWorkspaceHistory(@PathVariable UUID workspaceId) {
        try {
            return ResponseEntity.ok(changeLogRepository.findByWorkspaceIdOrderByTimestampDesc(workspaceId));
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping("/{workspaceId}/history")
    public ResponseEntity<ChangeLog> createHistoryLog(@PathVariable UUID workspaceId, @RequestBody ChangeLog newLog) {
        Workspace existingWorkspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));

        newLog.setWorkspace(existingWorkspace);
        ChangeLog savedLog = changeLogRepository.save(newLog);

        realtimeEventService.publishToAll("workspace_history_added", workspaceId.toString(), savedLog.getId().toString());
        return ResponseEntity.ok(savedLog);
    }
}
