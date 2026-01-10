package thl.campusprint.models;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode
public class BlockedWeekdays {

    @JsonProperty("weekdays")
    private Set<Integer> weekdays;
}
