package Vortex.BackND.services;
import Vortex.BackND.models.entities.BoardColumn;
import Vortex.BackND.models.entities.IssueCard;
import Vortex.BackND.repositories.BoardColumnRepository;
import Vortex.BackND.repositories.IssueCardRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class WebhookService {

    private final IssueCardRepository cardRepository;
    private final BoardColumnRepository columnRepository;
    private final IssueCardService issueCardService;

    public WebhookService(IssueCardRepository cardRepository,
                          BoardColumnRepository columnRepository,
                          IssueCardService issueCardService) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
        this.issueCardService = issueCardService;
    }

    public void processCommitMessage(String commitMessage) {

        Pattern regexPattern = Pattern.compile("([A-Za-z]+)\\s+#(\\d+)");
        Matcher matcher = regexPattern.matcher(commitMessage);

        while (matcher.find()) {

            String keyword = matcher.group(1); 
            Integer issueId = Integer.parseInt(matcher.group(2));
            
            System.out.println("🤖 VORTEX DETECTÓ UNA ACCIÓN: Keyword [" + keyword + "] en la Tarea [#" + issueId + "]");

            Optional<IssueCard> optCard = cardRepository.findByIssueNumber(issueId);
            Optional<BoardColumn> optCol = columnRepository.findFirstByKeywordIgnoreCase(keyword);

            if (optCard.isPresent() && optCol.isPresent()) {
                IssueCard tarjetaAMover = optCard.get();
                BoardColumn nuevaColumna = optCol.get();

                System.out.println("Moviendo Tarea '" + tarjetaAMover.getTitle() + "' a la Columna '" + nuevaColumna.getTitle() + "'");
                
                issueCardService.moveCardManually(tarjetaAMover.getId(), nuevaColumna.getId(), null);
            } else {
                System.out.println(" Se detectó el patrón pero el Issue #" + issueId + " o el Trigger no existen en DB.");
            }
        }
    }
}
