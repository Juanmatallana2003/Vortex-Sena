package Vortex.BackND.controller;

import Vortex.BackND.services.RealtimeEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/events")
public class EventsController {

    private final RealtimeEventService realtimeEventService;

    public EventsController(RealtimeEventService realtimeEventService) {
        this.realtimeEventService = realtimeEventService;
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        String userId = resolveUserId(user);
        return realtimeEventService.subscribe(userId);
    }

    private String resolveUserId(OAuth2User user) {
        String login = user.getAttribute("login");
        if (login != null && !login.isBlank()) {
            return login;
        }

        String fallbackName = user.getName();
        if (fallbackName != null && !fallbackName.isBlank()) {
            return fallbackName;
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario OAuth invalido");
    }
}
