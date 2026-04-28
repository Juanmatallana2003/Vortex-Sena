package Vortex.BackND.services;

import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.models.entities.IssueCard;
import Vortex.BackND.repositories.BoardColumnRepository;
import Vortex.BackND.repositories.IssueCardRepository;
import Vortex.BackND.repositories.WorkspaceMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
public class IssueCardService {

    private final IssueCardRepository cardRepository;
    private final BoardColumnRepository columnRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final GitHubApiService gitHubApiService;

    public IssueCardService(IssueCardRepository cardRepository,
                            BoardColumnRepository columnRepository,
                            WorkspaceMemberRepository workspaceMemberRepository,
                            GitHubApiService gitHubApiService) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.gitHubApiService = gitHubApiService;
    }

    @Transactional
    public IssueCard createCardInColumn(UUID columnId, IssueCard newCard) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("No se encontro la columna."));

        newCard.setColumn(column);
        newCard.setAssignees(validateAssigneesBelongToWorkspace(newCard.getAssignees(), column.getWorkspace().getId()));

        Integer maxPosition = cardRepository.findMaxPositionByColumnId(columnId);
        newCard.setPosition((maxPosition == null ? -1 : maxPosition) + 1);

        return cardRepository.save(newCard);
    }

    public IssueCard getCardById(UUID cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("No existe la tarjeta"));
    }

    @Transactional
    public IssueCard moveCardManually(UUID cardId, UUID newColumnId) {
        return moveCardManually(cardId, newColumnId, null);
    }

    @Transactional
    public IssueCard moveCardManually(UUID cardId, UUID newColumnId, Integer targetIndex) {
        IssueCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Tarjeta fantasma"));

        BoardColumn sourceColumn = card.getColumn();
        BoardColumn targetColumn = columnRepository.findById(newColumnId)
                .orElseThrow(() -> new RuntimeException("Columna fantasma"));

        UUID sourceColumnId = sourceColumn.getId();
        UUID targetColumnId = targetColumn.getId();

        if (sourceColumnId.equals(targetColumnId)) {
            List<IssueCard> sameColumnCards = new ArrayList<>(cardRepository.findByColumnIdOrderByPositionAsc(sourceColumnId));
            sameColumnCards.removeIf(existing -> existing.getId().equals(cardId));

            int insertIndex = clampIndex(targetIndex, sameColumnCards.size());
            sameColumnCards.add(insertIndex, card);

            reindexAndSave(sameColumnCards);
            card = sameColumnCards.stream()
                    .filter(existing -> existing.getId().equals(cardId))
                    .findFirst()
                    .orElse(card);
        } else {
            List<IssueCard> sourceCards = new ArrayList<>(cardRepository.findByColumnIdOrderByPositionAsc(sourceColumnId));
            sourceCards.removeIf(existing -> existing.getId().equals(cardId));

            List<IssueCard> targetCards = new ArrayList<>(cardRepository.findByColumnIdOrderByPositionAsc(targetColumnId));
            card.setColumn(targetColumn);
            int insertIndex = clampIndex(targetIndex, targetCards.size());
            targetCards.add(insertIndex, card);

            reindexAndSave(sourceCards);
            reindexAndSave(targetCards);
        }

        boolean seAcaboTarea = Boolean.TRUE.equals(targetColumn.getIsDoneColumn())
                || targetColumn.getTitle().equalsIgnoreCase("Finalizadas")
                || targetColumn.getTitle().equalsIgnoreCase("Done");

        String theRepositoryLocation = targetColumn.getWorkspace().getRepoUrl();

        if (theRepositoryLocation != null && card.getIssueNumber() != null) {
            gitHubApiService.updateIssueState(theRepositoryLocation, card.getIssueNumber(), seAcaboTarea);
        }

        return card;
    }

    // Metodo para actualizar texto, detalles, fechas y etiquetas
    @Transactional
    public IssueCard updateCardDetails(UUID cardId, IssueCard updatedData) {
        IssueCard card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("No existe la tarjeta"));

        card.setTitle(updatedData.getTitle());
        card.setDescription(updatedData.getDescription());
        card.setDueDate(updatedData.getDueDate());

        if (updatedData.getAssignees() != null) {
            UUID workspaceId = card.getColumn().getWorkspace().getId();
            card.setAssignees(validateAssigneesBelongToWorkspace(updatedData.getAssignees(), workspaceId));
        }

        if (updatedData.getTags() != null) {
            card.setTags(updatedData.getTags());
        }

        return cardRepository.save(card);
    }

    // Metodo para eliminar
    @Transactional
    public void deleteCard(UUID cardId) {
        cardRepository.deleteById(cardId);
    }

    private int clampIndex(Integer index, int size) {
        if (index == null) {
            return size;
        }
        return Math.max(0, Math.min(index, size));
    }

    private void reindexAndSave(List<IssueCard> cards) {
        for (int i = 0; i < cards.size(); i++) {
            cards.get(i).setPosition(i);
        }

        if (!cards.isEmpty()) {
            cardRepository.saveAll(cards);
        }
    }

    private List<String> validateAssigneesBelongToWorkspace(List<String> assignees, UUID workspaceId) {
        if (assignees == null) {
            return null;
        }

        List<String> sanitized = new ArrayList<>(new LinkedHashSet<>(assignees.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .toList()));

        if (sanitized.isEmpty()) {
            return List.of();
        }

        if (workspaceMemberRepository.findAllByWorkspaceId(workspaceId).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No hay miembros en este espacio. Agrega o invita personas desde View Members antes de asignar tareas."
            );
        }

        for (String assigneeId : sanitized) {
            UUID memberId;
            try {
                memberId = UUID.fromString(assigneeId);
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Formato de asignado invalido. Solo se permiten IDs de miembros reales del espacio."
                );
            }

            if (!workspaceMemberRepository.existsByIdAndWorkspaceId(memberId, workspaceId)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Uno o mas asignados no pertenecen a este espacio de trabajo."
                );
            }
        }

        return sanitized;
    }
}
