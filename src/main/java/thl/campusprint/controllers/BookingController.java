package thl.campusprint.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import thl.campusprint.models.BookingStatus;
import thl.campusprint.models.DTOs.BookingDTO;
import thl.campusprint.models.DTOs.ChangeBookingStatusDTO;
import thl.campusprint.models.DTOs.CreateBookingDTO;
import thl.campusprint.repositories.BookingRepository;
import thl.campusprint.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*") // Erlaubt Zugriff vom Frontend
public class BookingController {
    
    private final BookingService bookingService;

    private final BookingRepository bookingRepository;

    public BookingController(BookingService bookingService, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
    }

    // Die Getter methode akzeptiert alle filter die wir benötigen
    @GetMapping
    public List<BookingDTO> getBookings(
        @RequestParam(required = false) String email,   // optional (kann null sein)
        @RequestParam(required = false) UUID deviceId,   // optional (kann null sein)
        @RequestParam(required = false, defaultValue = "false") boolean futureOnly // optional (nur zukünftige buchungen)
    ) {
        return bookingRepository
            .findByFilters(email, futureOnly, LocalDateTime.now(), deviceId)
            .stream()
            .map(booking -> BookingDTO.fromDBModel(booking))
            .toList();
    }

    @PostMapping
    public BookingDTO createOrUpdateDevice(@RequestBody @Validated CreateBookingDTO newBooking) {
        return BookingDTO.fromDBModel(bookingService.createBooking(newBooking));
    }

    @PostMapping("/status")
    public ResponseEntity<String> changeBookingStatus(@RequestBody ChangeBookingStatusDTO dto) {
        // TODO Authentifizierung und Autorisierung hinzufügen
        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(dto.getStatus());
            if ( !bookingService.changeBookingStatus(dto.getBookingId(), bookingStatus, null, dto.getAdminMessage()) )
                return ResponseEntity.status(404).body("{ \"status\": 404, \"message\": \"Booking not Found\"}");
            return ResponseEntity.ok("{ \"status\": 200, \"message\": \"Booking status updated successfully\"}");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("{ \"status\": 400, \"message\": \"Staus is invalid\"}");
        }
    }

}
