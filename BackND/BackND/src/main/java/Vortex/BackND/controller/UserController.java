package Vortex.BackND.controller;

import Vortex.BackND.models.entities.FavoriteSpace;
import Vortex.BackND.models.entities.Workspace;
import Vortex.BackND.repositories.FavoriteSpaceRepository;
import Vortex.BackND.repositories.WorkspaceRepository;
import Vortex.BackND.services.RealtimeEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final FavoriteSpaceRepository favoriteSpaceRepository;
    private final WorkspaceRepository workspaceRepository;
    private final RealtimeEventService realtimeEventService;

    public UserController(FavoriteSpaceRepository favoriteSpaceRepository,
                          WorkspaceRepository workspaceRepository,
                          RealtimeEventService realtimeEventService) {
        this.favoriteSpaceRepository = favoriteSpaceRepository;
        this.workspaceRepository = workspaceRepository;
        this.realtimeEventService = realtimeEventService;
    }

    private String getGithubLogin(OAuth2User user) {
        if (user == null) {
            return null;
        }
        return user.getAttribute("login");
    }

    // Obtener los favoritos del usuario
    @GetMapping("/favorites")
    public ResponseEntity<List<Workspace>> getFavorites(@AuthenticationPrincipal OAuth2User user) {
        String githubId = getGithubLogin(user);
        if (githubId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Workspace> favorites = favoriteSpaceRepository.findByGithubUserId(githubId)
                .stream().map(FavoriteSpace::getWorkspace).collect(Collectors.toList());
        return ResponseEntity.ok(favorites);
    }

    // Marcar/Desmarcar como favorito
    @PostMapping("/favorites/{workspaceId}")
    public ResponseEntity<Void> toggleFavorite(@AuthenticationPrincipal OAuth2User user, @PathVariable UUID workspaceId) {
        String githubId = getGithubLogin(user);
        if (githubId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espacio no encontrado"));

        Optional<FavoriteSpace> existing = favoriteSpaceRepository.findByGithubUserIdAndWorkspaceId(githubId, workspaceId);

        if (existing.isPresent()) {
            favoriteSpaceRepository.delete(existing.get());
        } else {
            FavoriteSpace newFav = new FavoriteSpace();
            newFav.setGithubUserId(githubId);
            newFav.setWorkspace(workspace);
            favoriteSpaceRepository.save(newFav);
        }

        realtimeEventService.publishToUser(githubId, "favorite_toggled", workspaceId.toString(), null);
        return ResponseEntity.ok().build();
    }
}
