package thl.campusprint.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import thl.campusprint.models.Device;
import thl.campusprint.models.DeviceType; // <--- WICHTIG: Das Enum importieren
import thl.campusprint.repositories.DeviceRepository;

/**
 * Testklasse für den DeviceController. * ZWECK: Dieser Test prüft die "Web-Schicht" (Controller)
 * unserer Anwendung isoliert. Das bedeutet: Wir starten NICHT den kompletten Server und wir
 * verbinden uns NICHT mit einer echten Datenbank. Stattdessen simulieren ("mocken") wir die
 * Datenbank. * TECHNOLOGIEN: 1. @WebMvcTest: Startet eine abgespeckte Spring-Umgebung, die nur für
 * Controller zuständig ist. Das macht den Test extrem schnell (< 1 Sekunde). * 2. MockMvc: Ein
 * Werkzeug, das einen Webbrowser simuliert. Wir können damit HTTP-Anfragen (GET, POST, DELETE) an
 * unseren Controller senden, ohne das Netzwerk wirklich zu nutzen. * 3. @MockBean
 * (DeviceRepository): Da keine echte Datenbank da ist, erstellen wir eine Attrappe (Mock) des
 * Repositories. Wir sagen dem Mock vorher genau, wie er sich verhalten soll (z.B. "Wenn jemand nach
 * ID 1 sucht, gib diesen Drucker zurück"). * WAS WIRD GETESTET? - Mapping: Reagiert der Controller
 * auf die richtigen URLs (/api/devices)? - Datenfluss: Nimmt der Controller JSON an und wandelt es
 * korrekt in Java-Objekte um? - Antworten: Sendet der Controller das richtige JSON und den
 * richtigen HTTP-Status (200 OK, 404 Not Found) zurück? - Logik: Ruft der Controller die richtigen
 * Methoden im Repository auf?
 */
@WebMvcTest(DeviceController.class)
class DeviceControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private DeviceRepository deviceRepository;

    @Autowired private ObjectMapper objectMapper;

    // --- TEST 1: Alle Geräte holen ---
    @Test
    void shouldReturnAllDevices() throws Exception {
        Device d1 = new Device();
        d1.setId(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"));
        d1.setName("Printer A");
        d1.setType(DeviceType.FDM_Printer); // <--- Enum statt String
        
        Device d2 = new Device();
        d2.setId(UUID.fromString("77475bb1-2a2c-4076-8e79-c05c9a2fa3f4"));
        d2.setName("Printer B");
        d2.setType(DeviceType.SLA_Printer); // <--- Enum statt String

        when(deviceRepository.findAll()).thenReturn(Arrays.asList(d1, d2));

        mockMvc.perform(get("/api/devices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Printer A"))
                // Jackson wandelt das Enum automatisch in den String "FDM_Printer" um:
                .andExpect(jsonPath("$[0].type").value("FDM_Printer"));
    }

    // --- TEST 2: Einzelnes Gerät gefunden ---
    @Test
    void shouldReturnDeviceById() throws Exception {
        Device device = new Device();
        device.setId(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"));
        device.setName("My Printer");
        device.setType(DeviceType.FDM_Printer);

        when(deviceRepository.findById(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"))).thenReturn(Optional.of(device));

        mockMvc.perform(get("/api/devices/59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("My Printer"));
    }

    // --- TEST 3: Einzelnes Gerät NICHT gefunden ---
    @Test
    void shouldReturn404WhenDeviceNotFound() throws Exception {
        when(deviceRepository.findById(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"))).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/devices/59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5")).andExpect(status().isNotFound());
    }

    // --- TEST 4: Gerät erstellen (POST) ---
    @Test
    void shouldCreateDevice() throws Exception {
        // Input Objekt (Das schicken wir hin)
        Device inputDevice = new Device();
        inputDevice.setName("New Printer");
        inputDevice.setType(DeviceType.FDM_Printer); // <--- Enum nutzen

        // Saved Objekt (Das kommt aus der Mock-DB zurück)
        Device savedDevice = new Device();
        savedDevice.setId(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"));
        savedDevice.setName("New Printer");
        savedDevice.setType(DeviceType.FDM_Printer); // <--- Enum nutzen

        when(deviceRepository.save(any(Device.class))).thenReturn(savedDevice);

        mockMvc.perform(
                        post("/api/devices")
                                .contentType(MediaType.APPLICATION_JSON)
                                // ObjectMapper macht aus DeviceType.FDM_Printer automatisch
                                // "FDM_Printer" im JSON
                                .content(objectMapper.writeValueAsString(inputDevice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"))
                .andExpect(jsonPath("$.name").value("New Printer"))
                .andExpect(jsonPath("$.type").value("FDM_Printer"));
    }

    // --- TEST 5: Gerät löschen (Erfolg) ---
    @Test
    void shouldDeleteDevice() throws Exception {
        when(deviceRepository.existsById(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"))).thenReturn(true);
        doNothing().when(deviceRepository).deleteById(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"));

        mockMvc.perform(delete("/api/devices/59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5")).andExpect(status().isOk());

        verify(deviceRepository, times(1)).deleteById(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"));
    }

    // --- TEST 6: Gerät löschen (Nicht gefunden) ---
    @Test
    void shouldReturn404WhenDeletingNonExistingDevice() throws Exception {
        when(deviceRepository.existsById(UUID.fromString("59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5"))).thenReturn(false);

        mockMvc.perform(delete("/api/devices/59fc9c23-5395-4c6c-8c8c-9a1f2c03fcf5")).andExpect(status().isNotFound());

        verify(deviceRepository, never()).deleteById(any(UUID.class));
    }
}
