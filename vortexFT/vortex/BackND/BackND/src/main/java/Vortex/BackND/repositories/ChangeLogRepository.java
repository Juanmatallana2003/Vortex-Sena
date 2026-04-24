package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.ChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChangeLogRepository extends JpaRepository<ChangeLog, UUID> {
    // Busca los logs de un espacio específico, ordenados del más nuevo al más viejo
    List<ChangeLog> findByWorkspaceIdOrderByTimestampDesc(UUID workspaceId);
}