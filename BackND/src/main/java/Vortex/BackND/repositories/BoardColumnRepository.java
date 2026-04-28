package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {

    java.util.Optional<BoardColumn> findFirstByKeywordIgnoreCase(String keyword);

    @Query("SELECT COALESCE(MAX(c.position), -1) FROM BoardColumn c WHERE c.workspace.id = :workspaceId")
    Integer findMaxPositionByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    List<BoardColumn> findByWorkspaceIdOrderByPositionAsc(UUID workspaceId);

    Optional<BoardColumn> findFirstByWorkspaceIdAndKeywordIgnoreCase(UUID workspaceId, String keyword);

    Optional<BoardColumn> findFirstByWorkspaceIdAndIsDoneColumnTrue(UUID workspaceId);
} 
