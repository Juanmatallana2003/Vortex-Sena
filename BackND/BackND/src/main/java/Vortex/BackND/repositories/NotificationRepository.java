package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Query("""
            SELECT n
            FROM Notification n
            WHERE n.githubUserId = :githubUserId
              AND n.resolved = false
              AND (n.snoozedUntil IS NULL OR n.snoozedUntil <= :now)
            ORDER BY
              CASE
                WHEN n.priority = 'critical' THEN 0
                WHEN n.priority = 'important' THEN 1
                ELSE 2
              END,
              n.createdAt DESC
            """)
    List<Notification> findActiveForUser(@Param("githubUserId") String githubUserId, @Param("now") LocalDateTime now);

    @Query("""
            SELECT n
            FROM Notification n
            WHERE n.githubUserId = :githubUserId
              AND n.resolved = false
              AND n.read = false
              AND (n.snoozedUntil IS NULL OR n.snoozedUntil <= :now)
            ORDER BY n.createdAt DESC
            """)
    List<Notification> findUnreadForUser(@Param("githubUserId") String githubUserId, @Param("now") LocalDateTime now);

    Optional<Notification> findFirstByGithubUserIdAndDedupeKeyAndResolvedFalse(String githubUserId, String dedupeKey);

    long countByGithubUserIdAndReadFalseAndResolvedFalse(String githubUserId);
}
