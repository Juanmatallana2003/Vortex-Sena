package Vortex.BackND.controller;

import Vortex.BackND.models.dtos.NotificationDto;
import Vortex.BackND.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @AuthenticationPrincipal OAuth2User user,
            @RequestParam(defaultValue = "all") String scope
    ) {
        String githubLogin = resolveLogin(user);
        return ResponseEntity.ok(notificationService.getNotifications(githubLogin, scope));
    }

    @GetMapping("/focus")
    public ResponseEntity<List<NotificationDto>> getFocusNotifications(@AuthenticationPrincipal OAuth2User user) {
        String githubLogin = resolveLogin(user);
        return ResponseEntity.ok(notificationService.getFocusNotifications(githubLogin));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal OAuth2User user) {
        String githubLogin = resolveLogin(user);
        long unreadCount = notificationService.getUnreadCount(githubLogin);
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDto> markRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal OAuth2User user
    ) {
        String githubLogin = resolveLogin(user);
        return ResponseEntity.ok(notificationService.markRead(notificationId, githubLogin));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal OAuth2User user) {
        String githubLogin = resolveLogin(user);
        notificationService.markAllRead(githubLogin);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{notificationId}/snooze")
    public ResponseEntity<NotificationDto> snooze24h(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal OAuth2User user
    ) {
        String githubLogin = resolveLogin(user);
        return ResponseEntity.ok(notificationService.snooze24h(notificationId, githubLogin));
    }

    @PostMapping("/{notificationId}/actions")
    public ResponseEntity<NotificationDto> executeAction(
            @PathVariable UUID notificationId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal OAuth2User user
    ) {
        String githubLogin = resolveLogin(user);
        String action = payload == null ? null : payload.get("action");
        return ResponseEntity.ok(notificationService.executeAction(notificationId, githubLogin, action));
    }

    private String resolveLogin(OAuth2User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        String login = user.getAttribute("login");
        if (login != null && !login.isBlank()) {
            return login;
        }
        String fallbackName = user.getName();
        if (fallbackName == null || fallbackName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario OAuth invalido");
        }
        return fallbackName;
    }
}
