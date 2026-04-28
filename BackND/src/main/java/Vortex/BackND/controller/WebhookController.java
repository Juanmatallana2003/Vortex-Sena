package Vortex.BackND.controller;

import Vortex.BackND.services.RealtimeEventService;
import Vortex.BackND.services.WebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    private final WebhookService webhookService;
    private final RealtimeEventService realtimeEventService;

    public WebhookController(WebhookService webhookService, RealtimeEventService realtimeEventService) {
        this.webhookService = webhookService;
        this.realtimeEventService = realtimeEventService;
    }

    @PostMapping("/github")
    @SuppressWarnings("unchecked")
    public ResponseEntity<String> receiveGitHubWebhook(
            @RequestHeader(value = "X-GitHub-Event", required = false) String githubEvent,
            @RequestBody Map<String, Object> payload) {

        System.out.println("\n=========== WEBHOOK RECIBIDO ============");

        if ("push".equals(githubEvent)) {
            List<Map<String, Object>> commits = (List<Map<String, Object>>) payload.get("commits");

            if (commits != null && !commits.isEmpty()) {
                for (Map<String, Object> commit : commits) {
                    String commitMessage = (String) commit.get("message");
                    String commitId = commit.get("id") != null ? commit.get("id").toString() : null;

                    webhookService.processCommitMessage(commitMessage);
                    realtimeEventService.publishToAll("webhook_commit_processed", null, commitId);
                }
            }
        }

        System.out.println("==========================================");
        return ResponseEntity.ok("Webhook analizado");
    }
}
