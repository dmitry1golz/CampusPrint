package thl.campusprint.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode
public class BlockedWeekdays {

    @JsonProperty("weekdays")
    private Set<Integer> weekdays;
}
