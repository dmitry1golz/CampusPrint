package thl.campusprint.models;

public enum DeviceStatus {
    Available,
    Maintenance, // Wartung
    Defect,      // Defekt
    InUse        // Besetzt (optional, falls wir das brauchen)
}