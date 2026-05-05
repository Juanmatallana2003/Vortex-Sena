package Vortex.BackND.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseReplicationConfig implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseReplicationConfig.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseReplicationConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        enableReplicaIdentityFull("card_tags");
        enableReplicaIdentityFull("issue_assignees");
    }

    private void enableReplicaIdentityFull(String tableName) {
        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS public." + tableName + " REPLICA IDENTITY FULL");
        } catch (Exception ex) {
            logger.warn("No se pudo configurar REPLICA IDENTITY FULL para {}", tableName, ex);
        }
    }
}
