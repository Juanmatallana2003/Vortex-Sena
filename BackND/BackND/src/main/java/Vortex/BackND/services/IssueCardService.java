package Vortex.BackND.services;

import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.models.entities.IssueCard;
import Vortex.BackND.repositories.BoardColumnRepository;
import Vortex.BackND.repositories.IssueCardRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class IssueCardService {

    private final IssueCardRepository cardRepository;
    private final BoardColumnRepository columnRepository;

    public IssueCardService(IssueCardRepository cardRepository, BoardColumnRepository columnRepository) {

        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
    }

    public IssueCard createCardInColumn(UUID columnId, IssueCard newCard) {
        
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("No se encontró la Columna."));

        newCard.setColumn(column);
        return cardRepository.save(newCard);
    }

    public IssueCard moveCardManually(UUID cardId, UUID newColumnId) {
        
        IssueCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));

        BoardColumn newColumn = columnRepository.findById(newColumnId)
                .orElseThrow(() -> new RuntimeException("Nueva columna no encontrada"));

        card.setColumn(newColumn);
        return cardRepository.save(card);
    }
}