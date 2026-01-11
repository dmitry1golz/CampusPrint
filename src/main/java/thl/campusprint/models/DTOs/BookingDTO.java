package thl.campusprint.models.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import lombok.Data;
import thl.campusprint.models.Booking;
import thl.campusprint.models.Device;
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

    private BookingDTO() {}

    public static BookingDTO fromDBModel(Booking booking) {

        Device device = booking.getPrintJob().getDevice();

        BookingDTO dto = new BookingDTO();
        dto.id = booking.getId().toString();
        dto.printerName = device != null ? device.getName() : null;
        dto.startDate = booking.getStartTime();
        dto.endDate = booking.getEndTime();
        dto.notes = booking.getNotes();
        dto.message = booking.getAdminMessage();
        dto.videoUrl = booking.getPrintJob().getLivestream();
        dto.status = booking.getStatus().name();
        dto.lastModifiedBy =
                booking.getLastModifiedBy() != null ? booking.getLastModifiedBy().getEmail() : null;
        dto.lastModifiedAt = booking.getLastModified();
        dto.email = booking.getUser().getEmail();
        dto.deviveName = device != null ? device.getName() : null;
        dto.deviceId = device != null ? device.getId().toString() : null;
        dto.filePath = booking.getPrintJob().getFilePath();

        PrintJob pj = booking.getPrintJob();
        dto.print_options = pj.getSettings();

        return dto;
    }
}
