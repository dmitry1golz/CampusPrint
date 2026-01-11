package thl.campusprint.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import thl.campusprint.models.options.PrintJobSlectedOptions;

@Entity
@Table(name = "print_jobs")
@Getter
@Setter
public class PrintJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idprintjob", updatable = false, nullable = false, length = 36)
    @JdbcTypeCode(java.sql.Types.VARCHAR)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "device",
            nullable = true) // Nullable true, damit Devices gelöscht werden können
    private Device device;

    @JsonProperty("settings") // <--- ZWINGEND NOTWENDIG
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings", columnDefinition = "TEXT", nullable = true)
    private PrintJobSlectedOptions settings;

    @Column(name = "file_path", length = 45)
    private String filePath;

    @Column(name = "livestream", length = 60)
    private String livestream;
}
