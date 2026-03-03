package Vortex.BackND.repositories;

import Vortex.BackND.models.entities.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {

    java.util.Optional<BoardColumn> findFirstByKeywordIgnoreCase(String keyword);
} 