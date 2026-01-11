package thl.campusprint.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import thl.campusprint.models.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    @Query(
            "SELECT b FROM Booking b "
                    + "WHERE (:email IS NULL OR b.user.email = :email) "
                    + "AND (:futureOnly = false OR b.startTime > :now) "
                    + "AND (:deviceId IS NULL OR b.printJob.device.id = :deviceId)")
    List<Booking> findByFilters(
            @Param("email") String email,
            @Param("futureOnly") boolean futureOnly,
            @Param("now") LocalDateTime now,
            @Param("deviceId") UUID deviceId);
}
