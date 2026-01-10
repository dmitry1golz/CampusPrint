package thl.campusprint.models.DTOs;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NonNull;
import thl.campusprint.models.options.PrintJobSlectedOptions;

@Data
public class CreateBookingDTO {
    
    @NonNull
    private UUID printerId;

    @NonNull
    private String userEmail;

    @NonNull
    private LocalDateTime startDate;

    @NonNull
    private LocalDateTime endDate;

    private String notes;       // optional

    @JsonProperty("print_options")
    private PrintJobSlectedOptions print_options;

}
