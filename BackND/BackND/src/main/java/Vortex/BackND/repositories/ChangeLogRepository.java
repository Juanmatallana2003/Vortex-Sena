package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.ChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChangeLogRepository extends JpaRepository<ChangeLog, UUID> {
    // Busca los logs de un espacio especifico, ordenados del mas nuevo al mas viejo
    List<ChangeLog> findByWorkspaceIdOrderByTimestampDesc(UUID workspaceId);

    @Modifying
    @Transactional
    void deleteByWorkspaceId(UUID workspaceId);
}
