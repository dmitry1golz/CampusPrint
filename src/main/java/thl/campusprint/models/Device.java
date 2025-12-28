package thl.campusprint.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;

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

    @Column(length = 60)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('FDM_Printer', 'SLA_Printer', 'Laser_Cutter', 'CNC_Mill', 'Printer')")
    private DeviceType type;

    @Enumerated(EnumType.STRING)
    // Hier fügen wir Maintenance und Defect hinzu:
    @Column(nullable = false, columnDefinition = "ENUM('Available', 'Maintenance', 'Defect', 'InUse') DEFAULT 'Available'")
    private DeviceStatus status = DeviceStatus.Available;

    @JdbcTypeCode(SqlTypes.JSON) // Sagt Java: "Behandle das wie JSON"
    @Column(name = "print_options", columnDefinition = "TEXT") // Sagt DB: "Speichere es als Text, damit du nicht abstürzt"
    private Map<String, Object> printOptions;

    @Column(length = 255)
    private String image;

}