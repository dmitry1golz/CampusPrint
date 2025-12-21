-- ########################################################
-- Diese Datei initialisiert die Datenbank mit Beispiel-Daten für das CampusPrint-System.
-- Sie erstellt Benutzer, Geräte und einige Beispiel-Print-Jobs mit Buchungen.
-- ########################################################

-- ########################################################
-- 1. USERS ANLEGEN
-- ########################################################

INSERT INTO `users` (`idusers`, `email`, `password`, `role`) VALUES
                                                                 ('5de20ec1-158e-4f15-8012-3414d8c182a7', 'admin@campusprint.de', 'hashed_password_123', 'admin'),
                                                                 ('a5835e04-c027-4493-b40e-ca3eeff921c7', 'student@campusprint.de', NULL, 'user'),
                                                                 ('ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'extern@campusprint.de', NULL, 'user');

-- ########################################################
-- 2. DEVICES (GERÄTE) ANLEGEN
-- ########################################################
-- Mapping: FDM_Drucker -> FDM_Printer, SLA_Drucker -> SLA_Printer, etc.
-- Die technischen Details (volume, nozzle) landen im JSON-Feld print_options.

INSERT INTO `devices` (`iddevice`, `name`, `model`, `status`, `type`, `print_options`) VALUES
                                                                                           (1, 'Ultimaker S5', 'S5', 'Available', 'FDM_Printer', '{"volume": "330 x 240 x 300 mm", "nozzle": "0.4mm AA / BB", "layer": "0.1mm - 0.2mm"}'),
                                                                                           (2, 'Prusa MK4', 'MK4', 'Unavailable', 'FDM_Printer', '{"volume": "250 x 210 x 210 mm", "nozzle": "0.4mm", "layer": "0.2mm"}'),
                                                                                           (3, 'Bambu Lab X1 Carbon', 'X1 Carbon', 'Available', 'FDM_Printer', '{"volume": "256 x 256 x 256 mm", "nozzle": "0.4mm Hardened", "layer": "0.08mm - 0.2mm"}'),
                                                                                           (4, 'Formlabs Form 3+', 'Form 3+', 'Available', 'SLA_Printer', '{"volume": "145 x 145 x 185 mm", "layer": "0.025mm - 0.1mm"}'),
                                                                                           (5, 'Epilog Fusion Pro 32', 'Fusion Pro 32', 'Available', 'Laser_Cutter', '{"volume": "812 x 508 mm"}'),
                                                                                           (6, 'Trotec Speedy 100', 'Speedy 100', 'Unavailable', 'Laser_Cutter', '{"volume": "610 x 305 mm"}'),
                                                                                           (7, 'Stepcraft D-Series 840', 'D-Series 840', 'Unavailable', 'CNC_Mill', '{"volume": "600 x 840 mm"}'),
                                                                                           (8, 'HP DesignJet T650', 'T650', 'Available', 'Printer', '{"volume": "A0, A1, A2"}');

-- ########################################################
-- 3. PRINT JOBS & BOOKINGS
-- ########################################################
-- Da Bookings einen PrintJob referenzieren, müssen wir beide parallel füllen.
-- Status Mapping: pending=0, confirmed=1, running=2, completed/rejected=3 (nach Logik der DB)

-- Job 1 (Bachelorarbeit)
INSERT INTO `print_jobs` (`idprintjob`, `device`, `file_path`, `settings`) VALUES (1, 1, 'files/job1.gcode', '{"material": "PLA", "color": "white"}');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES (1, 0, '2025-11-25 10:00:00', '2025-11-25 14:00:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', 'Bachelorarbeit Gehäuse V3. Bitte weißes PLA nutzen.');

-- Job 2 (Architektur)
INSERT INTO `print_jobs` (`idprintjob`, `device`, `file_path`) VALUES (2, 5, 'files/arch.pdf');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES (2, 0, '2025-11-26 09:00:00', '2025-11-26 09:30:00', 'ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'Architektur-Modell M 1:50, Sperrholz 4mm.');

-- Job 3 (Pläne)
INSERT INTO `print_jobs` (`idprintjob`, `device`) VALUES (3, 8);
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES (3, 0, '2025-11-26 11:00:00', '2025-11-26 11:15:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', '3x A0 Pläne für Präsentation.');

-- Job 4 (Aktiv: Roboter AG)
INSERT INTO `print_jobs` (`idprintjob`, `device`, `livestream`) VALUES (4, 2, 'https://images.unsplash.com/...');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES (4, 2, '2025-11-24 08:00:00', '2025-11-24 12:00:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', 'Ersatzteile für Roboter-AG');

-- Job 5 (Abgelehnt: Waffen-Replika)
INSERT INTO `print_jobs` (`idprintjob`, `device`) VALUES (5, 1);
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`, `admin_message`)
VALUES (5, 3, '2025-11-19 14:00:00', '2025-11-19 18:00:00', 'ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'Privatprojekt', 'Drucken von Waffen-Repliken ist laut Nutzungsordnung untersagt.');

COMMIT;