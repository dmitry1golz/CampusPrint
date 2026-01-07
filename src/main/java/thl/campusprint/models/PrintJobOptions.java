package thl.campusprint.models;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode
public class PrintJobOptions {

    // @JsonProperty("weekdays")
    // TODO same as ResinProfile in SlaOptions?
    private String name;      // z.B. "Tough Resin"
    private String color_hex;
}
