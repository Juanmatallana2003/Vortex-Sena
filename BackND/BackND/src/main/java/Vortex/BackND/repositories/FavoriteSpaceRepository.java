package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.FavoriteSpace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteSpaceRepository extends JpaRepository<FavoriteSpace, UUID> {
    List<FavoriteSpace> findByGithubUserId(String githubUserId);
    Optional<FavoriteSpace> findByGithubUserIdAndWorkspaceId(String githubUserId, UUID workspaceId);

    @Modifying
    @Transactional
    void deleteByWorkspaceId(UUID workspaceId);
}
