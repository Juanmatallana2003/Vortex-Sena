package Vortex.BackND.controller;
import Vortex.BackND.models.entities.IssueCard;
import Vortex.BackND.services.IssueCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api") 
@CrossOrigin("*")
public class BoardCardController { 

    private final IssueCardService cardService;

    public BoardCardController(IssueCardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping("/columns/{columnId}/cards")
    public ResponseEntity<IssueCard> createCard(
            @PathVariable UUID columnId,
            @RequestBody IssueCard newCard) {
            
        IssueCard savedCard = cardService.createCardInColumn(columnId, newCard);
        return ResponseEntity.ok(savedCard);
    }

    @PutMapping("/cards/{cardId}/move/{newColumnId}")
    public ResponseEntity<IssueCard> moveCardManually(
            @PathVariable UUID cardId,
            @PathVariable UUID newColumnId) {
            
        IssueCard movedCard = cardService.moveCardManually(cardId, newColumnId);
        return ResponseEntity.ok(movedCard);
    }
}