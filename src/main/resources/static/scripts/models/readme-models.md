The models define what is available. No logic, only components.

scripts/
├── models/               <-- Die "Baupläne" (Interfaces)
│   ├── buchung.ts        (Definiert: Was ist eine Buchung?)
│   └── geraet.ts         (Definiert: Was ist ein Gerät?)
│
├── services/             <-- Die "Daten-Zentrale" (Logik & Mock-Daten)
│   ├── buchung-service.ts (Verwaltet Buchungs-Liste, Status-Updates)
│   └── geraet-service.ts  (Verwaltet Geräte-Liste, Löschen, Hinzufügen)
│
├── admin.ts              <-- Gehirn der Admin-Seite (nutzt Models & Services)
├── buchung.ts            <-- Gehirn der Student-Seite (nutzt Models & Services)
├── meine-drucke.ts       <-- Gehirn der Übersicht (nutzt Models & Services)
└── ...