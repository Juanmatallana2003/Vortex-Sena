package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, UUID> {
    List<WorkspaceMember> findAllByWorkspaceId(UUID workspaceId);

    boolean existsByIdAndWorkspaceId(UUID id, UUID workspaceId);

    Optional<WorkspaceMember> findByWorkspaceIdAndUsernameIgnoreCase(UUID workspaceId, String username);

    List<WorkspaceMember> findByIdIn(List<UUID> ids);
}
