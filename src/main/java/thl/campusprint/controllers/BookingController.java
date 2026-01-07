package thl.campusprint.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import thl.campusprint.models.DTOs.BookingDTO;
import thl.campusprint.repositories.BookingRepository;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*") // Erlaubt Zugriff vom Frontend
public class BookingController {
    
    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // Die Getter methode akzeptiert alle filter die wir benötigen
    @GetMapping
    public List<BookingDTO> getBookings(
        @RequestParam(required = false) String email,   // optional (kann null sein)
        @RequestParam(required = false) Integer deviceId,   // optional (kann null sein)
        @RequestParam(required = false, defaultValue = "false") boolean futureOnly // optional (nur zukünftige buchungen)
    ) {
        return bookingRepository
            .findByFilters(email, futureOnly, LocalDateTime.now(), deviceId)
            .stream()
            .map(booking -> BookingDTO.fromDBModel(booking))
            .toList();
    }

}
