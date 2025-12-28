package thl.campusprint.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thl.campusprint.models.Device;
import thl.campusprint.repositories.DeviceRepository;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = "*") // Erlaubt Zugriff vom Frontend
public class DeviceController {

    private final DeviceRepository deviceRepository;

    public DeviceController(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    // 1. Alle Geräte holen
    @GetMapping
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    // 2. Ein einzelnes Gerät holen
    @GetMapping("/{id}")
    public ResponseEntity<Device> getDeviceById(@PathVariable Integer id) {
        return deviceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 3. Gerät erstellen ODER aktualisieren
    // WICHTIG: Es darf nur EINE @PostMapping Methode ohne Pfad geben!
    @PostMapping
    public Device createOrUpdateDevice(@RequestBody Device device) {
        // JPA .save() macht automatisch ein INSERT (wenn ID neu) oder UPDATE (wenn ID existiert)
        return deviceRepository.save(device);
    }

    // 4. Gerät löschen
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Integer id) {
        if (deviceRepository.existsById(id)) {
            deviceRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}