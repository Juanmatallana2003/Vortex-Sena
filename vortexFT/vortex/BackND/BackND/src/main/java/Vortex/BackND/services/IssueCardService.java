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
    private final GitHubApiService gitHubApiService;

    public IssueCardService(IssueCardRepository cardRepository, BoardColumnRepository columnRepository, GitHubApiService gitHubApiService) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
        this.gitHubApiService = gitHubApiService;
    }

    public IssueCard createCardInColumn(UUID columnId, IssueCard newCard) {
        BoardColumn column = columnRepository.findById(columnId).orElseThrow(() -> new RuntimeException("No se encontró la Columna."));
        newCard.setColumn(column);
        return cardRepository.save(newCard);
    }

    public IssueCard moveCardManually(UUID cardId, UUID newColumnId) {

        IssueCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Tarjeta fantasma"));
        
        BoardColumn newColumn = columnRepository.findById(newColumnId)
                .orElseThrow(() -> new RuntimeException("Columna fantasma"));
                
        card.setColumn(newColumn);
        IssueCard finalCardState = cardRepository.save(card);
        
        boolean seAcaboTarea = Boolean.TRUE.equals(newColumn.getIsDoneColumn()) 
                            || newColumn.getTitle().equalsIgnoreCase("Finalizadas") 
                            || newColumn.getTitle().equalsIgnoreCase("Done");
        
        String theRepositoryLocation = newColumn.getWorkspace().getRepoUrl();

        if(theRepositoryLocation != null && finalCardState.getIssueNumber() != null) {

            gitHubApiService.updateIssueState(theRepositoryLocation, finalCardState.getIssueNumber(), seAcaboTarea);
        }
        
        return finalCardState;
    }

    // Método para Actualizar texto, detalles, fechas y etiquetas (Botón de Modificar)
    public IssueCard updateCardDetails(UUID cardId, IssueCard updatedData) {
        IssueCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("No existe la tarjeta"));
                
        card.setTitle(updatedData.getTitle());
        card.setDescription(updatedData.getDescription());
        
        // Actualizamos los nuevos campos
        card.setDueDate(updatedData.getDueDate());
        
        if (updatedData.getAssignees() != null) {
            card.setAssignees(updatedData.getAssignees());
        }
        
        if (updatedData.getTags() != null) {
            card.setTags(updatedData.getTags());
        }
        
        return cardRepository.save(card);
    }

    // Método para ELIMINAR (Papelera)
    public void deleteCard(UUID cardId) {
        cardRepository.deleteById(cardId);
    }
}