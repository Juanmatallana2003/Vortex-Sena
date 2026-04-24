package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.IssueCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IssueCardRepository extends JpaRepository<IssueCard, UUID> {

    java.util.Optional<IssueCard> findByIssueNumber(Integer issueNumber);

    List<IssueCard> findByDueDateIsNotNull();

    List<IssueCard> findByColumnIdOrderByPositionAsc(UUID columnId);

    @Query("SELECT COALESCE(MAX(c.position), -1) FROM IssueCard c WHERE c.column.id = :columnId")
    Integer findMaxPositionByColumnId(@Param("columnId") UUID columnId);
} 
