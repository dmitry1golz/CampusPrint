package thl.campusprint.models.options;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

// Das hier ist Magie: Es schaut in das JSON-Feld "tech_type"
// und entscheidet dann, welche Java-Klasse genutzt wird.
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "tech_type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = FdmOptions.class, name = "FDM"),
  @JsonSubTypes.Type(value = SlaOptions.class, name = "SLA"),
  @JsonSubTypes.Type(value = LaserOptions.class, name = "LASER"),
  @JsonSubTypes.Type(value = PaperOptions.class, name = "PAPER")
})
public abstract class DeviceOptions {
  // Hier könnten gemeinsame Felder stehen, z.B. Wartungsintervalle
}
