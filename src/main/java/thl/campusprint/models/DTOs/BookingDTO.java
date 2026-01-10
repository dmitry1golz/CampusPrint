package thl.campusprint.models.DTOs;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import thl.campusprint.models.Booking;
import thl.campusprint.models.PrintJob;
import thl.campusprint.models.options.PrintJobSlectedOptions;

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
    private String lastModifiedBy;
    private String email;
    private LocalDateTime lastModifiedAt;
    private String deviveName;
    private String deviceId;
    private String filePath;
    
    @JsonProperty("print_options")
    private PrintJobSlectedOptions print_options;

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
        dto.lastModifiedBy = booking.getLastModifiedBy() != null ? booking.getLastModifiedBy().getEmail() : null;
        dto.lastModifiedAt = booking.getLastModified();
        dto.email = booking.getUser().getEmail();
        dto.deviveName = booking.getPrintJob().getDevice().getName();
        dto.deviceId = booking.getPrintJob().getDevice().getId().toString();
        dto.filePath = booking.getPrintJob().getFilePath();
        PrintJob pj = booking.getPrintJob();
        dto.print_options = pj.getSettings();
        return dto;
    }
}
