package thl.campusprint.models.DTOs;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;
import lombok.NonNull;

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

}
