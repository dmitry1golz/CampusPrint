START TRANSACTION;

-- ########################################################
-- 1. USERS
-- ########################################################
INSERT INTO users (idusers, email, password, role)
VALUES ('5de20ec1-158e-4f15-8012-3414d8c182a7', 'admin@campusprint.de',
        '$2a$10$9dn.2Zr8gLWEgeXMK36Hne1Q1oyllEZ2fJFzazS.8mHjVmbq48M/y', 'admin'),
       ('a5835e04-c027-4493-b40e-ca3eeff921c7', 'student@campusprint.de', NULL, 'user'),
       ('ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'extern@campusprint.de', NULL, 'user');

-- ########################################################
-- 2. DEVICES
-- ########################################################
-- CNC (ID 7) entfernt. HP Plotter bleibt ID 8.
INSERT INTO devices (iddevice, name, description, model, status, type, image, print_options)
VALUES (1, 'Ultimaker S5',
        'Anfaengerfreundlicher 3D Drucker',
        'S5', 'Available', 'FDM_Printer',
        'https://ultimaker.com/wp-content/uploads/2023/05/The_Ultimaker_S5.jpg',
        '{
          "dimensions": {"x": 330, "y": 240, "z": 300},
          "available_materials": [
            {"name": "PLA", "temp_nozzle": 210, "temp_bed": 60, "color_hex": "#FFFFFF"},
            {"name": "Tough PLA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#000000"},
            {"name": "PVA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#FFFFCC"}
          ],
          "supported_layer_heights": [0.06, 0.1, 0.15, 0.2],
          "nozzle_sizes": [0.25, 0.4, 0.8]
        }'),
       (2, 'Prusa MK4',
        'Vielseitiger FDM-3D-Drucker',
        'MK4', 'Unavailable', 'FDM_Printer',
        'assets/prusa.png',
        '{
          "dimensions": {"x": 250, "y": 210, "z": 210},
          "available_materials": [
            {"name": "Prusament PLA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#FF5733"},
            {"name": "PETG", "temp_nozzle": 240, "temp_bed": 80, "color_hex": "#33FF57"}
          ],
          "supported_layer_heights": [0.05, 0.1, 0.2, 0.3],
          "nozzle_sizes": [0.4, 0.6]
        }'),
       (3, 'Bambu Lab X1 Carbon',
        'High-End',
        'X1 Carbon', 'Available', 'FDM_Printer',
        'https://cdn.idealo.com/folder/Product/202800/9/202800985/s1_produktbild_max_1/bambu-lab-x1-carbon-combo.jpg',
        '{
          "dimensions": {"x": 256, "y": 256, "z": 256},
          "available_materials": [
            {"name": "PLA Basic", "temp_nozzle": 220, "temp_bed": 55, "color_hex": "#AAAAAA"},
            {"name": "PAHT-CF", "temp_nozzle": 290, "temp_bed": 100, "color_hex": "#111111"}
          ],
          "supported_layer_heights": [0.08, 0.12, 0.16, 0.2, 0.24],
          "nozzle_sizes": [0.4, 0.6]
        }'),
       (4, 'Formlabs Form 3+', NULL, 'Form 3+', 'Available', 'SLA_Printer',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8d24UVAiCg6YEOh4P42Kc231qf6mfpw4eNg&s',
        '{
          "dimensions": {"x": 145, "y": 145, "z": 185},
          "available_materials": [
            {"name": "Standard Grey Resin", "temp_nozzle": 0, "temp_bed": 0, "color_hex": "#808080"},
            {"name": "Clear Resin", "temp_nozzle": 0, "temp_bed": 0, "color_hex": "#E0E0E0"}
          ],
          "supported_layer_heights": [0.025, 0.05, 0.1],
          "nozzle_sizes": []
        }'),
       (5, 'Epilog Fusion Pro 32',
        'Geeignet für Gravieren und dicke Materialien',
        'Fusion Pro 32', 'Available', 'Laser_Cutter',
        'https://www.epiloglaser.com/assets/img/fusion-pro-24-laser.webp',
        '{
          "work_area": {"x": 812, "y": 508},
          "presets": [
            {"material": "Sperrholz 4mm", "thickness": 4, "power": 90, "speed": 15},
            {"material": "Acryl 3mm", "thickness": 3, "power": 100, "speed": 20},
            {"material": "Gravur Glas", "thickness": 0, "power": 40, "speed": 80}
          ]
        }'),
       (6, 'Trotec Speedy 100',
        'Kleine bis mittelgroßer Objekte',
        'Speedy 100', 'Unavailable', 'Laser_Cutter',
        'https://puzzlebox3d.com/wp-content/uploads/2022/05/TRO_Speedy_100_2020_03_right-scaled.webp',
        '{
          "work_area": {"x": 610, "y": 305},
          "presets": [
            {"material": "Papier/Karton", "thickness": 1, "power": 20, "speed": 60}
          ]
        }'),
       (8, 'HP DesignJet T650',
        'Großformat-Plotter',
        'T650', 'Available', 'Printer',
        'https://plotterkaufen24.com/wp-content/uploads/2020/10/HP-Designjet-T650-36-Zoll-A0-Drucker.jpg',
        '{
          "paper_weights": [80, 90, 120, 180],
          "formats": ["A4", "A3", "A2", "A1", "A0", "Rollenware 24 Zoll"]
        }');

-- ########################################################
-- 3. PRINT JOBS
-- ########################################################
-- NB: file_path und settings dürfen NULL sein (Job3 war bei dir "device only")
INSERT INTO print_jobs (idprintjob, device, file_path, settings, livestream)
VALUES (1, 1, 'files/job1.gcode', '{
  "material": "PLA",
  "color": "white"
}', NULL),
       (2, 5, 'files/arch.pdf', NULL, NULL),
       (3, 8, NULL, NULL, NULL),
       (4, 2, NULL, NULL, 'https://images.unsplash.com/...'),
       (5, 1, NULL, NULL, NULL);

-- ########################################################
-- 4. BOOKINGS
-- ########################################################
-- ВАЖНО: status теперь строка (чтобы не было багов из-за ordinal)
INSERT INTO bookings (idbooking, print_job, status, start_time, end_time, user_id, user_notes, admin_message,
                      lastModifiedBy)
VALUES (1, 1, 'pending', '2025-11-25 10:00:00', '2025-11-25 14:00:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7',
        'Bachelorarbeit Gehaeuse V3. Bitte weißes PLA nutzen.', NULL, NULL),

       (2, 2, 'pending', '2025-11-26 09:00:00', '2025-11-26 09:30:00', 'ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3',
        'Architektur-Modell M 1:50, Sperrholz 4mm.', NULL, NULL),

       (3, 3, 'pending', '2025-11-26 11:00:00', '2025-11-26 11:15:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7',
        '3x A0 Plaene fuer Praesentation.', NULL, NULL),

       (4, 4, 'running', '2025-11-24 08:00:00', '2025-11-24 12:00:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7',
        'Ersatzteile fuer Roboter-AG', NULL, NULL),

       (5, 5, 'rejected', '2025-11-19 14:00:00', '2025-11-19 18:00:00', 'ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3',
        'Privatprojekt', 'Drucken von Waffen-Repliken ist laut Nutzungsordnung untersagt.',
        '5de20ec1-158e-4f15-8012-3414d8c182a7');

COMMIT;
