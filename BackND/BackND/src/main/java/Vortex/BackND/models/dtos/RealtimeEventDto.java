package Vortex.BackND.models.dtos;

public record RealtimeEventDto(
        String type,
        String workspaceId,
        String entityId,
        String timestamp
) {
}
