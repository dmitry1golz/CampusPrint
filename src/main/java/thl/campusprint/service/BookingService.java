package thl.campusprint.service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;
import thl.campusprint.models.Booking;
import thl.campusprint.models.BookingStatus;
import thl.campusprint.models.DTOs.CreateBookingDTO;
import thl.campusprint.models.Device;
import thl.campusprint.models.PrintJob;
import thl.campusprint.models.User;
import thl.campusprint.models.UserRole;
import thl.campusprint.repositories.BookingRepository;
import thl.campusprint.repositories.DeviceRepository;
import thl.campusprint.repositories.PrintJobRepository;
import thl.campusprint.repositories.UserRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final PrintJobRepository printJobRepository;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            DeviceRepository deviceRepository,
            PrintJobRepository printJobRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.printJobRepository = printJobRepository;
    }

    @Transactional
    public Booking createBooking(CreateBookingDTO dto) {
        Optional<User> userOpt = userRepository.findByEmail(dto.getUserEmail());

        Device device =
                deviceRepository
                        .findById(dto.getPrinterId())
                        .orElseThrow(() -> new IllegalArgumentException("Device not found"));

        User user;
        if (userOpt.isEmpty()) {
            // Create user if it does not exist
            user = new User();
            user.setEmail(dto.getUserEmail());
            user.setRole(UserRole.user);
            user = userRepository.save(user);
        } else {
            user = userOpt.get();
        }

        PrintJob printJob = new PrintJob();
        printJob.setDevice(device);
        printJob.setSettings(dto.getPrint_options());
        printJob = printJobRepository.save(printJob);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setPrintJob(printJob);
        booking.setStartTime(dto.getStartDate());
        booking.setEndTime(dto.getEndDate());
        booking.setStatus(BookingStatus.pending);
        booking.setNotes(dto.getNotes());
        booking.setLastModified(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    @Transactional
    public boolean changeBookingStatus(
            int bookingId,
            BookingStatus status,
            thl.campusprint.models.User modifiedBy,
            String adminMessage) {
        return bookingRepository
                .findById(bookingId)
                .map(
                        booking -> {
                            booking.setStatus(status);

                            // FIX: Using LocalDateTime.now() instead of email string
                            // The field is a timestamp, so we record WHEN it changed.
                            booking.setLastModified(LocalDateTime.now());

                            if (adminMessage != null) booking.setAdminMessage(adminMessage);
                            bookingRepository.save(booking);
                            return true;
                        })
                .orElse(false);
    }

    // FIX: Removed duplicate method definitions
    public User getAdminUser(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
