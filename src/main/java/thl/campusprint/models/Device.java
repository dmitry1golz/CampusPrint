package thl.campusprint.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "devices")
@Getter
@Setter
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "iddevice")
    private Integer id;

    @Column(nullable = false, length = 45)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(length = 60)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('FDM_Printer', 'SLA_Printer', 'Laser_Cutter', 'CNC_Mill', 'Printer')")
    private DeviceType type;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false, 
        // Füge 'Unavailable' hier wieder ein!
        columnDefinition = "ENUM('Available', 'Unavailable', 'Maintenance', 'Defect', 'InUse') DEFAULT 'Unavailable'"
    )
    private DeviceStatus status = DeviceStatus.Unavailable;

    @JsonProperty("print_options") // <--- Das sorgt dafür, dass im JSON "print_options" steht
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "print_options", columnDefinition = "TEXT") 
    private Map<String, Object> printOptions;

    @Column(length = 255)
    private String image;

}