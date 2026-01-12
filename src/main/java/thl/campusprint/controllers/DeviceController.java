package thl.campusprint.controllers;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import thl.campusprint.models.Device;
import thl.campusprint.models.PrintJob;
import thl.campusprint.repositories.DeviceRepository;
import thl.campusprint.repositories.PrintJobRepository;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = "*")
public class DeviceController {

    private final DeviceRepository deviceRepository;
    private final PrintJobRepository printJobRepository;

    public DeviceController(
            DeviceRepository deviceRepository, PrintJobRepository printJobRepository) {
        this.deviceRepository = deviceRepository;
        this.printJobRepository = printJobRepository;
    }

    // 1. Alle Geräte holen
    @GetMapping
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    // 2. Ein einzelnes Gerät holen
    @GetMapping("/{id}")
    public ResponseEntity<Device> getDeviceById(@PathVariable UUID id) {
        return deviceRepository
                .findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Gerät erstellen ODER aktualisieren
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Device createOrUpdateDevice(@RequestBody Device device) {
        return deviceRepository.save(device);
    }

    // 4. Gerät löschen
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDevice(@PathVariable UUID id) {
        if (deviceRepository.existsById(id)) {
            List<PrintJob> jobs = printJobRepository.findByDeviceId(id);
            for (PrintJob job : jobs) {
                job.setDevice(null);
            }
            printJobRepository.saveAll(jobs);

            deviceRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
