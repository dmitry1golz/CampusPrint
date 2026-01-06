-- ########################################################
-- 1. USERS
-- ########################################################
INSERT INTO `users` (`idusers`, `email`, `password`, `role`) VALUES
('5de20ec1-158e-4f15-8012-3414d8c182a7', 'admin@campusprint.de', 'hashed_password_123', 'admin'),
('a5835e04-c027-4493-b40e-ca3eeff921c7', 'student@campusprint.de', NULL, 'user'),
('ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'extern@campusprint.de', NULL, 'user');

-- ########################################################
-- 2. DEVICES
-- ########################################################

INSERT INTO `devices` (`iddevice`, `name`, `description`, `model`, `status`, `type`, `image`, `print_options`) VALUES
(1, 'Ultimaker S5',
 'Anfaengerfreundlicher 3D Drucker',
 'S5', 'Available', 'FDM_Printer',
 'https://ultimaker.com/wp-content/uploads/2023/05/The_Ultimaker_S5.jpg',
 '{
    "tech_type": "FDM",
    "dimensions": {"x": 330, "y": 240, "z": 300}, 
    "available_materials": [
        {"name": "PLA", "temp_nozzle": 210, "temp_bed": 60, "color_hex": "#FFFFFF"},
        {"name": "Tough PLA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#000000"},
        {"name": "PVA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#FFFFCC"}
    ],
    "supported_layer_heights": [0.06, 0.1, 0.15, 0.2],
    "nozzle_sizes": [0.25, 0.4, 0.8]
 }'
),
(2, 'Prusa MK4',
 'Vielseitiger FDM-3D-Drucker',
 'MK4', 'Unavailable', 'FDM_Printer',
 'assets/prusa.png',
 '{
    "tech_type": "FDM",
    "dimensions": {"x": 250, "y": 210, "z": 210},
    "available_materials": [
        {"name": "Prusament PLA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#FF5733"},
        {"name": "PETG", "temp_nozzle": 240, "temp_bed": 80, "color_hex": "#33FF57"}
    ],
    "supported_layer_heights": [0.05, 0.1, 0.2, 0.3],
    "nozzle_sizes": [0.4, 0.6]
 }'
),
(3, 'Bambu Lab X1 Carbon',
 'High-End',
 'X1 Carbon', 'Available', 'FDM_Printer',
 'https://cdn.idealo.com/folder/Product/202800/9/202800985/s1_produktbild_max_1/bambu-lab-x1-carbon-combo.jpg',
 '{
    "tech_type": "FDM",
    "dimensions": {"x": 256, "y": 256, "z": 256},
    "available_materials": [
        {"name": "PLA Basic", "temp_nozzle": 220, "temp_bed": 55, "color_hex": "#AAAAAA"},
        {"name": "PAHT-CF", "temp_nozzle": 290, "temp_bed": 100, "color_hex": "#111111"}
    ],
    "supported_layer_heights": [0.08, 0.12, 0.16, 0.2, 0.24],
    "nozzle_sizes": [0.4, 0.6]
 }'
),
(4, 'Formlabs Form 3+', 
 null, 
 'Form 3+', 'Available', 'SLA_Printer',
 'https://formlabs-media.formlabs.com/filer_public_thumbnails/filer_public/5c/42/5c423730-a359-4d6d-888e-6c68a0a9926c/form-3-plus-render-front.png__1054x1054_subsampling-2.png',
 '{
    "tech_type": "SLA",
    "dimensions": {"x": 145, "y": 145, "z": 185},
    "available_materials": [
        {"name": "Standard Grey Resin", "color_hex": "#808080"},
        {"name": "Clear Resin", "color_hex": "#E0E0E0"}
    ],
    "supported_layer_heights": [0.025, 0.05, 0.1]
 }'
),
(5, 'Epilog Fusion Pro 32',
 'Geeignet für Gravieren und dicke Materialien',
 'Fusion Pro 32', 'Available', 'Laser_Cutter',
 'https://www.epiloglaser.com/assets/img/fusion-pro-24-laser.webp',
 '{
    "tech_type": "LASER",
    "work_area": {"x": 812, "y": 508},
    "presets": [
        {"material": "Sperrholz 4mm", "thickness": 4, "power": 90, "speed": 15},
        {"material": "Acryl 3mm", "thickness": 3, "power": 100, "speed": 20},
        {"material": "Gravur Glas", "thickness": 0, "power": 40, "speed": 80}
    ]
 }'
),
(6, 'Trotec Speedy 100',
 'Kleine bis mittelgroßer Objekte'
 ,'Speedy 100', 'Unavailable', 'Laser_Cutter',
 'https://puzzlebox3d.com/wp-content/uploads/2022/05/TRO_Speedy_100_2020_03_right-scaled.webp',
 '{
    "tech_type": "LASER",
    "work_area": {"x": 610, "y": 305},
    "presets": [
        {"material": "Papier/Karton", "thickness": 1, "power": 20, "speed": 60}
    ]
 }'
),
(8, 'HP DesignJet T650',
 'Großformat-Plotter',
 'T650', 'Available', 'Printer',
 'https://plotterkaufen24.com/wp-content/uploads/2020/10/HP-Designjet-T650-36-Zoll-A0-Drucker.jpg',
 '{
    "tech_type": "PAPER",
    "paper_weights": [80, 90, 120, 180],
    "formats": ["A4", "A3", "A2", "A1", "A0", "Rollenware 24 Zoll"]
 }'
);

-- ########################################################
-- 3. PRINT JOBS & BOOKINGS
-- ########################################################

INSERT INTO `print_jobs` (`idprintjob`, `device`, `file_path`, `settings`) VALUES (1, 1, 'files/job1.gcode', '{"material": "PLA", "color": "white"}');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES (1, 0, '2025-11-25 10:00:00', '2025-11-25 14:00:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', 'Bachelorarbeit Gehaeuse V3. Bitte weißes PLA nutzen.');

INSERT INTO `print_jobs` (`idprintjob`, `device`, `file_path`) VALUES (2, 5, 'files/arch.pdf');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES (2, 0, '2025-11-26 09:00:00', '2025-11-26 09:30:00', 'ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'Architektur-Modell M 1:50, Sperrholz 4mm.');

INSERT INTO `print_jobs` (`idprintjob`, `device`) VALUES (3, 8);
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES (3, 0, '2025-11-26 11:00:00', '2025-11-26 11:15:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', '3x A0 Plaene fuer Praesentation.');

INSERT INTO `print_jobs` (`idprintjob`, `device`, `livestream`) VALUES (4, 2, 'https://images.unsplash.com/...');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES (4, 2, '2025-11-24 08:00:00', '2025-11-24 12:00:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', 'Ersatzteile fuer Roboter-AG');

INSERT INTO `print_jobs` (`idprintjob`, `device`) VALUES (5, 1);
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`, `admin_message`)
VALUES (5, 3, '2025-11-19 14:00:00', '2025-11-19 18:00:00', 'ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'Privatprojekt', 'Drucken von Waffen-Repliken ist laut Nutzungsordnung untersagt.');

COMMIT;