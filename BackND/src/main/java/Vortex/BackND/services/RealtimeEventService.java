package Vortex.BackND.services;

import Vortex.BackND.models.dtos.RealtimeEventDto;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class RealtimeEventService {

    private static final long SSE_TIMEOUT_MS = 0L;
    private static final long HEARTBEAT_INTERVAL_SECONDS = 20L;

    private final Map<String, Set<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatExecutor = Executors.newSingleThreadScheduledExecutor();

    @PostConstruct
    public void initHeartbeat() {
        heartbeatExecutor.scheduleAtFixedRate(this::sendHeartbeat, HEARTBEAT_INTERVAL_SECONDS, HEARTBEAT_INTERVAL_SECONDS, TimeUnit.SECONDS);
    }

    @PreDestroy
    public void shutdown() {
        heartbeatExecutor.shutdownNow();
        emittersByUser.values().forEach(set -> set.forEach(SseEmitter::complete));
        emittersByUser.clear();
    }

    public SseEmitter subscribe(String userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        emittersByUser.computeIfAbsent(userId, key -> new CopyOnWriteArraySet<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError((ex) -> removeEmitter(userId, emitter));

        sendToEmitter(userId, emitter, new RealtimeEventDto(
                "connected",
                null,
                userId,
                Instant.now().toString()
        ));

        return emitter;
    }

    public void publishToAll(String type, String workspaceId, String entityId) {
        RealtimeEventDto event = new RealtimeEventDto(type, workspaceId, entityId, Instant.now().toString());
        emittersByUser.forEach((userId, emitters) -> emitters.forEach(emitter -> sendToEmitter(userId, emitter, event)));
    }

    public void publishToUser(String userId, String type, String workspaceId, String entityId) {
        RealtimeEventDto event = new RealtimeEventDto(type, workspaceId, entityId, Instant.now().toString());
        Set<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        emitters.forEach(emitter -> sendToEmitter(userId, emitter, event));
    }

    private void sendHeartbeat() {
        RealtimeEventDto heartbeat = new RealtimeEventDto("heartbeat", null, null, Instant.now().toString());
        emittersByUser.forEach((userId, emitters) -> emitters.forEach(emitter -> sendToEmitter(userId, emitter, heartbeat)));
    }

    private void sendToEmitter(String userId, SseEmitter emitter, RealtimeEventDto payload) {
        try {
            emitter.send(SseEmitter.event().name(payload.type()).data(payload));
        } catch (IOException | IllegalStateException ex) {
            removeEmitter(userId, emitter);
        }
    }

    private void removeEmitter(String userId, SseEmitter emitter) {
        Set<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null) {
            return;
        }

        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByUser.remove(userId);
        }
    }
}
