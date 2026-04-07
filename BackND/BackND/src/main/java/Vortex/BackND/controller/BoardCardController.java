package Vortex.BackND.controller;
import Vortex.BackND.services.GitHubApiService;
import Vortex.BackND.models.entities.IssueCard;
import Vortex.BackND.services.IssueCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api") 
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

    @PutMapping("/cards/{cardId}")
    public ResponseEntity<IssueCard> updateCardDetails(
            @PathVariable UUID cardId,
            @RequestBody IssueCard updatedCard) {
            
        IssueCard savedCard = cardService.updateCardDetails(cardId, updatedCard);
        return ResponseEntity.ok(savedCard);
    }

    @DeleteMapping("/cards/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable UUID cardId) {
        
        cardService.deleteCard(cardId);
        return ResponseEntity.noContent().build(); 
    }
}