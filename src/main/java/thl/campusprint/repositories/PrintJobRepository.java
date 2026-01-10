package thl.campusprint.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thl.campusprint.models.PrintJob;

@Repository
public interface PrintJobRepository extends JpaRepository<PrintJob, UUID> {}
