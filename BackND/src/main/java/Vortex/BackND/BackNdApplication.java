package Vortex.BackND;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackNdApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackNdApplication.class, args);
	}

}
