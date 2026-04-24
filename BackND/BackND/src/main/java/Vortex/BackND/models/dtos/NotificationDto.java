package Vortex.BackND.models.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record NotificationDto(
        UUID id,
        String type,
        String priority,
        String title,
        String message,
        String reason,
        UUID workspaceId,
        UUID cardId,
        String actorLogin,
        String actorName,
        String actorAvatar,
        Boolean read,
        Boolean resolved,
        LocalDateTime snoozedUntil,
        LocalDateTime createdAt,
        List<String> suggestedActions
) {
}
