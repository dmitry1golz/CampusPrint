package thl.campusprint.models.DTOs;

import java.time.LocalDateTime;

import lombok.Data;
import thl.campusprint.models.Booking;

@Data
public class BookingDTO {

    private String id;
    private String printerName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String notes;
    private String message;
    private String videoUrl;
    private String status;

    private BookingDTO() { }

    public static BookingDTO fromDBModel(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.id = booking.getId().toString();
        dto.printerName = booking.getPrintJob().getDevice().getName();
        dto.startDate = booking.getStartTime();
        dto.endDate = booking.getEndTime();
        dto.notes = booking.getNotes();
        dto.message = booking.getAdminMessage();
        dto.videoUrl = booking.getPrintJob().getLivestream();
        dto.status = booking.getStatus().name();
        return dto;
    }
}
