package Vortex.BackND.controller;
import Vortex.BackND.services.WebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {

        this.webhookService = webhookService;
    }

    @PostMapping("/github")
    public ResponseEntity<String> receiveGitHubWebhook(
            @RequestHeader(value = "X-GitHub-Event", required = false) String githubEvent,
            @RequestBody Map<String, Object> payload) {

        System.out.println("\n=========== WEBHOOK RECIBIDO ============");

        if ("push".equals(githubEvent)) {
            List<Map<String, Object>> commits = (List<Map<String, Object>>) payload.get("commits");
            
            if (commits != null && !commits.isEmpty()) {
                for (Map<String, Object> commit : commits) {
                    String mensajeCommit = (String) commit.get("message");
                    
                    webhookService.processCommitMessage(mensajeCommit);
                }
            }
        }
        System.out.println("==========================================");
        return ResponseEntity.ok("Webhook analizado");
    }
}