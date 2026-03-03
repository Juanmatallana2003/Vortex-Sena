package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.IssueCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface IssueCardRepository extends JpaRepository<IssueCard, UUID> {

    java.util.Optional<IssueCard> findByIssueNumber(Integer issueNumber);
}