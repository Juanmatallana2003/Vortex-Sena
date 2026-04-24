package Vortex.BackND.services;

import Vortex.BackND.models.dtos.NotificationDto;
import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.models.entities.IssueCard;
import Vortex.BackND.models.entities.Notification;
import Vortex.BackND.models.entities.Workspace;
import Vortex.BackND.models.entities.WorkspaceMember;
import Vortex.BackND.repositories.BoardColumnRepository;
import Vortex.BackND.repositories.IssueCardRepository;
import Vortex.BackND.repositories.NotificationRepository;
import Vortex.BackND.repositories.WorkspaceMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final IssueCardRepository issueCardRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final IssueCardService issueCardService;
    private final RealtimeEventService realtimeEventService;

    public NotificationService(NotificationRepository notificationRepository,
                               IssueCardRepository issueCardRepository,
                               BoardColumnRepository boardColumnRepository,
                               WorkspaceMemberRepository workspaceMemberRepository,
                               IssueCardService issueCardService,
                               RealtimeEventService realtimeEventService) {
        this.notificationRepository = notificationRepository;
        this.issueCardRepository = issueCardRepository;
        this.boardColumnRepository = boardColumnRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.issueCardService = issueCardService;
        this.realtimeEventService = realtimeEventService;
    }

    public List<NotificationDto> getNotifications(String githubLogin, String scope) {
        LocalDateTime now = LocalDateTime.now();
        List<Notification> data;
        if ("unread".equalsIgnoreCase(scope)) {
            data = notificationRepository.findUnreadForUser(githubLogin, now);
        } else {
            data = notificationRepository.findActiveForUser(githubLogin, now);
        }
        return data.stream().map(this::toDto).toList();
    }

    public List<NotificationDto> getFocusNotifications(String githubLogin) {
        List<NotificationDto> unread = getNotifications(githubLogin, "unread");
        return unread.stream()
                .sorted((a, b) -> {
                    int byPriority = priorityWeight(a.priority()) - priorityWeight(b.priority());
                    if (byPriority != 0) {
                        return byPriority;
                    }
                    if (a.createdAt() == null || b.createdAt() == null) {
                        return 0;
                    }
                    return b.createdAt().compareTo(a.createdAt());
                })
                .limit(3)
                .toList();
    }

    public long getUnreadCount(String githubLogin) {
        return notificationRepository.countByGithubUserIdAndReadFalseAndResolvedFalse(githubLogin);
    }

    @Transactional
    public NotificationDto markRead(UUID notificationId, String githubLogin) {
        Notification notification = getOwnedNotification(notificationId, githubLogin);
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        publishUpdated(saved);
        return toDto(saved);
    }

    @Transactional
    public void markAllRead(String githubLogin) {
        List<Notification> unread = notificationRepository.findUnreadForUser(githubLogin, LocalDateTime.now());
        for (Notification notification : unread) {
            notification.setRead(true);
            Notification saved = notificationRepository.save(notification);
            publishUpdated(saved);
        }
    }

    @Transactional
    public NotificationDto snooze24h(UUID notificationId, String githubLogin) {
        Notification notification = getOwnedNotification(notificationId, githubLogin);
        notification.setSnoozedUntil(LocalDateTime.now().plusHours(24));
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        publishUpdated(saved);
        return toDto(saved);
    }

    @Transactional
    public NotificationDto executeAction(UUID notificationId, String githubLogin, String action) {
        Notification notification = getOwnedNotification(notificationId, githubLogin);
        String normalized = action == null ? "" : action.trim().toLowerCase(Locale.ROOT);

        switch (normalized) {
            case "open_card" -> notification.setRead(true);
            case "dismiss" -> {
                notification.setRead(true);
                notification.setResolved(true);
            }
            case "assign_me" -> {
                assignCardToCurrentUser(notification, githubLogin);
                notification.setRead(true);
            }
            case "start_now" -> {
                moveCardToInProgress(notification);
                notification.setRead(true);
            }
            case "mark_done" -> {
                moveCardToDone(notification);
                notification.setRead(true);
                notification.setResolved(true);
            }
            case "snooze_24h" -> {
                notification.setRead(true);
                notification.setSnoozedUntil(LocalDateTime.now().plusHours(24));
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Accion no soportada");
        }

        Notification saved = notificationRepository.save(notification);
        publishUpdated(saved);
        return toDto(saved);
    }

    @Transactional
    public void notifyWorkspaceMemberInvited(Workspace workspace, WorkspaceMember invitedMember, String actorLogin) {
        String invitedLogin = extractLoginFromUsername(invitedMember.getUsername());
        if (invitedLogin == null || invitedLogin.isBlank()) {
            return;
        }

        createOrRefreshNotification(
                invitedLogin,
                "workspace_invite",
                "important",
                "Te invitaron a un espacio",
                "Ahora puedes colaborar en \"" + workspace.getName() + "\".",
                "Recibiste esta notificacion porque te agregaron como miembro del espacio.",
                workspace.getId(),
                null,
                "workspace_invite:" + workspace.getId() + ":" + invitedLogin,
                actorLogin,
                actorLogin,
                null
        );
    }

    @Transactional
    public void notifyCardCreated(IssueCard card, String actorLogin) {
        if (actorLogin == null || actorLogin.isBlank()) {
            return;
        }
        createOrRefreshNotification(
                actorLogin,
                "card_created",
                "info",
                "Issue creada",
                "Creaste #" + safeIssueNumber(card) + " \"" + safeTitle(card) + "\".",
                "Recibes esta notificacion para confirmar que la accion se guardo correctamente.",
                card.getColumn().getWorkspace().getId(),
                card.getId(),
                "card_created:" + card.getId() + ":" + actorLogin,
                actorLogin,
                actorLogin,
                null
        );
    }

    @Transactional
    public void notifyCardUpdated(IssueCard before, IssueCard after, String actorLogin) {
        Set<String> beforeAssignees = before.getAssignees() == null ? Set.of() : new HashSet<>(before.getAssignees());
        Set<String> afterAssignees = after.getAssignees() == null ? Set.of() : new HashSet<>(after.getAssignees());

        Set<String> newAssignees = new HashSet<>(afterAssignees);
        newAssignees.removeAll(beforeAssignees);

        List<String> targetLogins = resolveLoginsFromAssigneeIds(new ArrayList<>(newAssignees));
        for (String targetLogin : targetLogins) {
            createOrRefreshNotification(
                    targetLogin,
                    "card_assigned",
                    "important",
                    "Nueva asignacion",
                    "Te asignaron #" + safeIssueNumber(after) + " \"" + safeTitle(after) + "\".",
                    "Recibiste esta notificacion porque ahora apareces como responsable de esta tarea.",
                    after.getColumn().getWorkspace().getId(),
                    after.getId(),
                    "card_assigned:" + after.getId() + ":" + targetLogin,
                    actorLogin,
                    actorLogin,
                    null
            );
        }
    }

    @Transactional
    public void notifyCardMoved(IssueCard card, String previousColumnTitle, String actorLogin) {
        List<String> targetLogins = resolveLoginsFromAssigneeIds(card.getAssignees());
        if (targetLogins.isEmpty()) {
            return;
        }

        String newTitle = card.getColumn().getTitle();
        String message = "La issue #" + safeIssueNumber(card) + " ahora esta en \"" + newTitle + "\".";
        String reason = "Recibiste esta notificacion porque estas asignado a la tarea y su estado cambio.";

        for (String targetLogin : targetLogins) {
            createOrRefreshNotification(
                    targetLogin,
                    "card_status_changed",
                    isDoneColumn(card.getColumn()) ? "info" : "important",
                    "Cambio de estado",
                    message,
                    reason,
                    card.getColumn().getWorkspace().getId(),
                    card.getId(),
                    "card_status_changed:" + card.getId() + ":" + targetLogin + ":" + newTitle,
                    actorLogin,
                    actorLogin,
                    null
            );
        }
    }

    @Transactional
    public void notifyColumnDeleted(UUID workspaceId, String columnTitle, String actorLogin) {
        List<String> workspaceLogins = getWorkspaceLogins(workspaceId);
        for (String login : workspaceLogins) {
            createOrRefreshNotification(
                    login,
                    "column_deleted",
                    "important",
                    "Se elimino una columna",
                    "La columna \"" + columnTitle + "\" fue eliminada del tablero.",
                    "Recibiste esta notificacion porque participas en este espacio de trabajo.",
                    workspaceId,
                    null,
                    "column_deleted:" + workspaceId + ":" + columnTitle + ":" + login,
                    actorLogin,
                    actorLogin,
                    null
            );
        }
    }

    @Scheduled(cron = "0 */20 * * * *")
    @Transactional
    public void runPredictiveAlerts() {
        List<IssueCard> cards = issueCardRepository.findByDueDateIsNotNull();
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        for (IssueCard card : cards) {
            if (card.getColumn() == null || isDoneColumn(card.getColumn())) {
                continue;
            }

            LocalDate dueDate = parseDueDate(card.getDueDate());
            if (dueDate == null) {
                continue;
            }

            long daysToDue = ChronoUnit.DAYS.between(today, dueDate);
            if (daysToDue <= 1) {
                String priority = daysToDue < 0 ? "critical" : "important";
                String title = daysToDue < 0 ? "Tarea vencida" : "Riesgo de vencimiento";
                String message = daysToDue < 0
                        ? "La issue #" + safeIssueNumber(card) + " \"" + safeTitle(card) + "\" esta vencida."
                        : "La issue #" + safeIssueNumber(card) + " \"" + safeTitle(card) + "\" vence en menos de 24h.";
                String reason = "Recibiste esta alerta para priorizar entregas y evitar atrasos.";

                List<String> recipients = resolveRecipientsForCard(card);
                for (String login : recipients) {
                    createOrRefreshNotification(
                            login,
                            "due_risk",
                            priority,
                            title,
                            message,
                            reason,
                            card.getColumn().getWorkspace().getId(),
                            card.getId(),
                            "due_risk:" + card.getId() + ":" + dueDate + ":" + login,
                            "vortex-bot",
                            "Vortex Bot",
                            null
                    );
                }
            }

            if (card.getUpdatedAt() != null && card.getUpdatedAt().isBefore(now.minusHours(48))) {
                List<String> recipients = resolveRecipientsForCard(card);
                for (String login : recipients) {
                    createOrRefreshNotification(
                            login,
                            "inactivity_risk",
                            "important",
                            "Riesgo por inactividad",
                            "La issue #" + safeIssueNumber(card) + " no tiene movimiento reciente.",
                            "Recibiste esta alerta porque la tarea podria estar bloqueada o perdida de foco.",
                            card.getColumn().getWorkspace().getId(),
                            card.getId(),
                            "inactivity_risk:" + card.getId() + ":" + login,
                            "vortex-bot",
                            "Vortex Bot",
                            null
                    );
                }
            }
        }
    }

    private Notification getOwnedNotification(UUID notificationId, String githubLogin) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificacion no encontrada"));
        if (!notification.getGithubUserId().equals(githubLogin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos sobre esta notificacion");
        }
        return notification;
    }

    private void assignCardToCurrentUser(Notification notification, String githubLogin) {
        IssueCard card = getCardFromNotification(notification);
        UUID workspaceId = card.getColumn().getWorkspace().getId();

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUsernameIgnoreCase(workspaceId, "@" + githubLogin)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No eres miembro del espacio. Debes estar invitado para asignarte tareas."
                ));

        List<String> assignees = card.getAssignees() == null ? new ArrayList<>() : new ArrayList<>(card.getAssignees());
        String memberId = member.getId().toString();
        if (!assignees.contains(memberId)) {
            assignees.add(memberId);
            card.setAssignees(assignees);
            issueCardRepository.save(card);
            realtimeEventService.publishToAll("card_updated", workspaceId.toString(), card.getId().toString());
        }
    }

    private void moveCardToInProgress(Notification notification) {
        IssueCard card = getCardFromNotification(notification);
        UUID workspaceId = card.getColumn().getWorkspace().getId();

        Optional<BoardColumn> byKeyword = boardColumnRepository.findFirstByWorkspaceIdAndKeywordIgnoreCase(workspaceId, "wip");
        BoardColumn target = byKeyword.orElseGet(() ->
                boardColumnRepository.findByWorkspaceIdOrderByPositionAsc(workspaceId).stream()
                        .filter(column -> {
                            String title = column.getTitle() == null ? "" : column.getTitle().toLowerCase(Locale.ROOT);
                            return title.contains("proceso") || title.contains("progress");
                        })
                        .findFirst()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No existe columna En Proceso"))
        );

        IssueCard moved = issueCardService.moveCardManually(card.getId(), target.getId());
        realtimeEventService.publishToAll("card_moved", workspaceId.toString(), moved.getId().toString());
    }

    private void moveCardToDone(Notification notification) {
        IssueCard card = getCardFromNotification(notification);
        UUID workspaceId = card.getColumn().getWorkspace().getId();

        BoardColumn target = boardColumnRepository.findFirstByWorkspaceIdAndIsDoneColumnTrue(workspaceId)
                .orElseGet(() ->
                        boardColumnRepository.findByWorkspaceIdOrderByPositionAsc(workspaceId).stream()
                                .filter(this::isDoneColumn)
                                .findFirst()
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No existe columna de finalizacion"))
                );

        IssueCard moved = issueCardService.moveCardManually(card.getId(), target.getId());
        realtimeEventService.publishToAll("card_moved", workspaceId.toString(), moved.getId().toString());
    }

    private IssueCard getCardFromNotification(Notification notification) {
        if (notification.getCardId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta notificacion no tiene tarjeta asociada");
        }
        return issueCardRepository.findById(notification.getCardId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarjeta no encontrada"));
    }

    private List<String> resolveRecipientsForCard(IssueCard card) {
        List<String> byAssignee = resolveLoginsFromAssigneeIds(card.getAssignees());
        if (!byAssignee.isEmpty()) {
            return byAssignee;
        }
        return getWorkspaceLogins(card.getColumn().getWorkspace().getId());
    }

    private List<String> resolveLoginsFromAssigneeIds(List<String> assigneeIds) {
        if (assigneeIds == null || assigneeIds.isEmpty()) {
            return List.of();
        }

        List<UUID> memberIds = assigneeIds.stream()
                .map(id -> {
                    try {
                        return UUID.fromString(id);
                    } catch (Exception ex) {
                        return null;
                    }
                })
                .filter(id -> id != null)
                .toList();

        if (memberIds.isEmpty()) {
            return List.of();
        }

        List<WorkspaceMember> members = workspaceMemberRepository.findByIdIn(memberIds);
        return members.stream()
                .map(WorkspaceMember::getUsername)
                .map(this::extractLoginFromUsername)
                .filter(login -> login != null && !login.isBlank())
                .distinct()
                .toList();
    }

    private List<String> getWorkspaceLogins(UUID workspaceId) {
        return workspaceMemberRepository.findAllByWorkspaceId(workspaceId).stream()
                .map(WorkspaceMember::getUsername)
                .map(this::extractLoginFromUsername)
                .filter(login -> login != null && !login.isBlank())
                .distinct()
                .toList();
    }

    private String extractLoginFromUsername(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        String trimmed = username.trim();
        if (trimmed.startsWith("@")) {
            return trimmed.substring(1);
        }
        if (trimmed.contains("@")) {
            return null;
        }
        return trimmed;
    }

    private boolean isDoneColumn(BoardColumn column) {
        if (column == null) {
            return false;
        }
        if (Boolean.TRUE.equals(column.getIsDoneColumn())) {
            return true;
        }
        String title = column.getTitle() == null ? "" : column.getTitle().toLowerCase(Locale.ROOT);
        String keyword = column.getKeyword() == null ? "" : column.getKeyword().toLowerCase(Locale.ROOT);
        return title.contains("terminad") || title.contains("done") || keyword.equals("done");
    }

    private LocalDate parseDueDate(String dueDate) {
        if (dueDate == null || dueDate.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dueDate);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private NotificationDto toDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getType(),
                notification.getPriority(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getReason(),
                notification.getWorkspaceId(),
                notification.getCardId(),
                notification.getActorLogin(),
                notification.getActorName(),
                notification.getActorAvatar(),
                notification.getRead(),
                notification.getResolved(),
                notification.getSnoozedUntil(),
                notification.getCreatedAt(),
                suggestedActions(notification)
        );
    }

    private List<String> suggestedActions(Notification notification) {
        if (notification.getCardId() == null) {
            return List.of("dismiss");
        }

        return switch (notification.getType()) {
            case "card_assigned" -> List.of("open_card", "assign_me", "start_now", "snooze_24h", "dismiss");
            case "due_risk" -> List.of("open_card", "start_now", "mark_done", "snooze_24h", "dismiss");
            case "inactivity_risk" -> List.of("open_card", "start_now", "snooze_24h", "dismiss");
            case "card_status_changed" -> List.of("open_card", "dismiss");
            default -> List.of("open_card", "dismiss");
        };
    }

    private int priorityWeight(String priority) {
        if ("critical".equalsIgnoreCase(priority)) {
            return 0;
        }
        if ("important".equalsIgnoreCase(priority)) {
            return 1;
        }
        return 2;
    }

    private Notification createOrRefreshNotification(String githubLogin,
                                                     String type,
                                                     String priority,
                                                     String title,
                                                     String message,
                                                     String reason,
                                                     UUID workspaceId,
                                                     UUID cardId,
                                                     String dedupeKey,
                                                     String actorLogin,
                                                     String actorName,
                                                     String actorAvatar) {
        if (githubLogin == null || githubLogin.isBlank()) {
            return null;
        }

        Notification existing = null;
        if (dedupeKey != null && !dedupeKey.isBlank()) {
            existing = notificationRepository.findFirstByGithubUserIdAndDedupeKeyAndResolvedFalse(githubLogin, dedupeKey)
                    .orElse(null);
        }

        Notification target = existing == null ? new Notification() : existing;
        target.setGithubUserId(githubLogin);
        target.setType(type);
        target.setPriority(priority);
        target.setTitle(title);
        target.setMessage(message);
        target.setReason(reason);
        target.setWorkspaceId(workspaceId);
        target.setCardId(cardId);
        target.setDedupeKey(dedupeKey);
        target.setGroupKey(type + ":" + (cardId == null ? "none" : cardId));
        target.setActorLogin(actorLogin);
        target.setActorName(actorName);
        target.setActorAvatar(actorAvatar);
        target.setResolved(false);
        target.setRead(false);
        target.setSnoozedUntil(null);

        Notification saved = notificationRepository.save(target);
        realtimeEventService.publishToUser(githubLogin, "notification_created",
                workspaceId == null ? null : workspaceId.toString(),
                saved.getId().toString());
        return saved;
    }

    private void publishUpdated(Notification notification) {
        realtimeEventService.publishToUser(
                notification.getGithubUserId(),
                "notification_updated",
                notification.getWorkspaceId() == null ? null : notification.getWorkspaceId().toString(),
                notification.getId().toString()
        );
    }

    private String safeTitle(IssueCard card) {
        return card.getTitle() == null || card.getTitle().isBlank() ? "Sin titulo" : card.getTitle();
    }

    private String safeIssueNumber(IssueCard card) {
        return card.getIssueNumber() == null ? "?" : card.getIssueNumber().toString();
    }
}
