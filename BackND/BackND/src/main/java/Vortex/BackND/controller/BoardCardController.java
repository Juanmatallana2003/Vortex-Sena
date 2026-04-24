package Vortex.BackND.controller;

import Vortex.BackND.models.entities.IssueCard;
import Vortex.BackND.services.IssueCardService;
import Vortex.BackND.services.NotificationService;
import Vortex.BackND.services.RealtimeEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BoardCardController {

    private final IssueCardService cardService;
    private final RealtimeEventService realtimeEventService;
    private final NotificationService notificationService;

    public BoardCardController(IssueCardService cardService,
                               RealtimeEventService realtimeEventService,
                               NotificationService notificationService) {
        this.cardService = cardService;
        this.realtimeEventService = realtimeEventService;
        this.notificationService = notificationService;
    }

    @PostMapping("/columns/{columnId}/cards")
    public ResponseEntity<IssueCard> createCard(
            @PathVariable UUID columnId,
            @RequestBody IssueCard newCard,
            @AuthenticationPrincipal OAuth2User user) {

        IssueCard savedCard = cardService.createCardInColumn(columnId, newCard);
        String workspaceId = savedCard.getColumn().getWorkspace().getId().toString();

        realtimeEventService.publishToAll("card_created", workspaceId, savedCard.getId().toString());
        notificationService.notifyCardCreated(savedCard, resolveActorLogin(user));
        return ResponseEntity.ok(savedCard);
    }

    @PutMapping("/cards/{cardId}/move/{newColumnId}")
    public ResponseEntity<IssueCard> moveCardManually(
            @PathVariable UUID cardId,
            @PathVariable UUID newColumnId,
            @RequestParam(required = false) Integer targetIndex,
            @AuthenticationPrincipal OAuth2User user) {

        IssueCard before = cardService.getCardById(cardId);
        String previousColumnTitle = before.getColumn() != null ? before.getColumn().getTitle() : null;

        IssueCard movedCard = cardService.moveCardManually(cardId, newColumnId, targetIndex);
        String workspaceId = movedCard.getColumn().getWorkspace().getId().toString();

        realtimeEventService.publishToAll("card_moved", workspaceId, movedCard.getId().toString());
        notificationService.notifyCardMoved(movedCard, previousColumnTitle, resolveActorLogin(user));
        return ResponseEntity.ok(movedCard);
    }

    @PutMapping("/cards/{cardId}")
    public ResponseEntity<IssueCard> updateCardDetails(
            @PathVariable UUID cardId,
            @RequestBody IssueCard updatedCard,
            @AuthenticationPrincipal OAuth2User user) {

        IssueCard before = snapshot(cardService.getCardById(cardId));
        IssueCard savedCard = cardService.updateCardDetails(cardId, updatedCard);
        String workspaceId = savedCard.getColumn().getWorkspace().getId().toString();

        realtimeEventService.publishToAll("card_updated", workspaceId, savedCard.getId().toString());
        notificationService.notifyCardUpdated(before, savedCard, resolveActorLogin(user));
        return ResponseEntity.ok(savedCard);
    }

    @DeleteMapping("/cards/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable UUID cardId) {

        IssueCard existingCard = cardService.getCardById(cardId);
        String workspaceId = existingCard.getColumn().getWorkspace().getId().toString();

        cardService.deleteCard(cardId);
        realtimeEventService.publishToAll("card_deleted", workspaceId, cardId.toString());

        return ResponseEntity.noContent().build();
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

    private IssueCard snapshot(IssueCard source) {
        IssueCard copy = new IssueCard();
        copy.setId(source.getId());
        copy.setTitle(source.getTitle());
        copy.setIssueNumber(source.getIssueNumber());
        copy.setColumn(source.getColumn());
        copy.setAssignees(source.getAssignees() == null ? List.of() : List.copyOf(source.getAssignees()));
        return copy;
    }
}
