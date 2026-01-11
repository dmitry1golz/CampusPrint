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
    @JsonSubTypes.Type(value = FdmSelectedOptions.class, name = "FDM"),
    @JsonSubTypes.Type(value = SlaSelectedOptions.class, name = "SLA"),
    @JsonSubTypes.Type(value = LaserSelectedOptions.class, name = "LASER"),
    @JsonSubTypes.Type(value = PaperSelectedOptions.class, name = "PAPER")
})
public abstract class PrintJobSlectedOptions {}
