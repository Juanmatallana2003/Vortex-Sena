package Vortex.BackND.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${github.token}")
    private String rawGitTokenBot;

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return Map.of("authenticated", false);
        }
        return Map.of(
                "authenticated", true,
                "name", user.getAttribute("name") != null ? user.getAttribute("name") : user.getAttribute("login"),
                "avatar", user.getAttribute("avatar_url"),
                "githubUsernameId", user.getAttribute("login") 
        );
    }


    @GetMapping("/repos")
    public List<Map<String, Object>> getLiveMyGitHubRepos(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) return new ArrayList<>(); 
        try {
            RestTemplate rest = new RestTemplate();
            HttpHeaders cabezasGits = new HttpHeaders();
            cabezasGits.set("Authorization", "Bearer " + rawGitTokenBot);

            HttpEntity<String> eA = new HttpEntity<>("parameters", cabezasGits);
            ResponseEntity<List<Map<String, Object>>> respuestaGit = rest.exchange(
                    "https://api.github.com/user/repos?per_page=100&sort=updated",
                    HttpMethod.GET,
                    eA,
                    new ParameterizedTypeReference<>() {}
            );

            return respuestaGit.getBody();

        } catch(Exception erroS) {
            System.err.println("Imposible arrastar lista: " + erroS.getMessage());
            return new ArrayList<>();
        }
    }
}