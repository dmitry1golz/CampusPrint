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
    @Column(columnDefinition = "ENUM('FDM_Printer', 'SLA_Printer', 'Laser_Cutter', 'Printer')")
    private DeviceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('Available', 'Unavailable') DEFAULT 'Unavailable'")
    private DeviceStatus status = DeviceStatus.Unavailable;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "print_options", columnDefinition = "json")
    private Map<String, Object> printOptions;

    @Column(length = 95)
    private String image;

}