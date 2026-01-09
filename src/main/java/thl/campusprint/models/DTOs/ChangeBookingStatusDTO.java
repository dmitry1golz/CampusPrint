package thl.campusprint.models.DTOs;

import io.micrometer.common.lang.NonNull;
import lombok.Data;

@Data
public class ChangeBookingStatusDTO {
    
    @NonNull
    private int bookingId;

    @NonNull
    private String status;

    private String adminMessage;

}
