package thl.campusprint.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import thl.campusprint.models.options.DeviceOptions;

@Entity
@Table(name = "devices")
@Getter
@Setter
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "iddevice", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 45)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(length = 60)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('FDM_Printer', 'SLA_Printer', 'Laser_Cutter', 'Printer')")
    private DeviceType type;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            // Füge 'Unavailable' hier wieder ein!
            columnDefinition = "ENUM('Available', 'Unavailable') DEFAULT 'Unavailable'")
    private DeviceStatus status = DeviceStatus.Unavailable;

    @JsonProperty("print_options") // <--- ZWINGEND NOTWENDIG
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "print_options", columnDefinition = "TEXT")
    private DeviceOptions printOptions;

    @Column(length = 255)
    private String image;

    @JsonProperty("booking_availability_blocked_weekdays")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "booking_availability_blocked_weekdays", columnDefinition = "TEXT")
    private BlockedWeekdays bookingAvailabilityBlockedWeekdays;
}
