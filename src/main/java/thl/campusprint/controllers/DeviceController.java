package thl.campusprint.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thl.campusprint.models.Device;
import thl.campusprint.repositories.DeviceRepository;

import java.util.List;

@RestController
@RequestMapping("/api/devices") // Die Basis-URL für alles hier drin
@CrossOrigin(origins = "*") // Erlaubt Zugriff von überall (für Dev okay)
public class DeviceController {

    private final DeviceRepository deviceRepository;

    // Constructor Injection (besser als @Autowired)
    public DeviceController(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    // 1. Alle Geräte holen
    // GET http://localhost:8090/api/devices
    @GetMapping
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    // 2. Ein einzelnes Gerät holen
    // GET http://localhost:8090/api/devices/1
    @GetMapping("/{id}")
    public ResponseEntity<Device> getDeviceById(@PathVariable Integer id) {
        return deviceRepository.findById(id)
                .map(device -> ResponseEntity.ok(device)) // 200 OK + JSON
                .orElse(ResponseEntity.notFound().build()); // 404 Not Found
    }
    
    // Optional: Neues Gerät anlegen (für Admin Bereich später)
    @PostMapping
    public Device createDevice(@RequestBody Device device) {
        return deviceRepository.save(device);
    }
}