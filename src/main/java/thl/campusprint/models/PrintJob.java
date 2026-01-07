package thl.campusprint.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "print_jobs")
@Getter
@Setter
public class PrintJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idprintjob")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device", nullable = false)
    private Device device;

    @JsonProperty("settings") // <--- ZWINGEND NOTWENDIG
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings", columnDefinition = "TEXT")
    private PrintJobOptions settings;

    @Column(name = "file_path", length = 45)
    private String filePath;

    @Column(name = "livestream", length = 60)
    private String livestream;
}