package Vortex.BackND.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class GitHubApiService {

    @Value("${github.token}")
    private String githubToken; 

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public void updateIssueState(String repoUrl, Integer issueNumber, boolean isFinalColumn) {
        try {
            System.out.println("\n Intentando cambiar estatus en GitHub. ID #" + issueNumber);
            
            String repoPath = repoUrl.replace("https://github.com/", "").replace(".git", "");
            String apiUrl = "https://api.github.com/repos/" + repoPath + "/issues/" + issueNumber;

            String estado = isFinalColumn ? "closed" : "open";
            String jsonBody = "{\"state\": \"" + estado + "\"}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Authorization", "Bearer " + githubToken)
                    .header("Accept", "application/vnd.github.v3+json")
                    .header("Content-Type", "application/json")
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                System.out.println("Sincronización OK con GitHub Oficial: El Issue #"+ issueNumber +" fue seteado a -> " + estado.toUpperCase());
            } else {
                System.out.println("Alerta. La plataforma dice Código " + response.statusCode() + ". Motivo: " + response.body());
            }

        } catch (Exception e) {
            System.out.println("Fracasó red Java a nube web oficial... Motivo: " + e.getMessage());
        }
    }
}