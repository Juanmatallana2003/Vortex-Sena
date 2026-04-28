package Vortex.BackND.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "github_user_id", nullable = false)
    private String githubUserId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String priority; // critical | important | info

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1200)
    private String message;

    @Column(length = 600)
    private String reason;

    @Column(name = "workspace_id")
    private UUID workspaceId;

    @Column(name = "card_id")
    private UUID cardId;

    @Column(name = "group_key")
    private String groupKey;

    @Column(name = "dedupe_key")
    private String dedupeKey;

    @Column(name = "actor_login")
    private String actorLogin;

    @Column(name = "actor_name")
    private String actorName;

    @Column(name = "actor_avatar")
    private String actorAvatar;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @Builder.Default
    @Column(name = "is_resolved", nullable = false)
    private Boolean resolved = false;

    @Column(name = "snoozed_until")
    private LocalDateTime snoozedUntil;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
