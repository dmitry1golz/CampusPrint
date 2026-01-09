package thl.campusprint.models.DTOs;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NonNull;

@Data
public class CreateBookingDTO {
    
    @NonNull
    private Integer printerId;

    @NonNull
    private String userEmail;

    @NonNull
    private LocalDateTime startDate;

    @NonNull
    private LocalDateTime endDate;

    private String notes;       // optional

}
