-- ########################################################
-- 1. USERS
-- ########################################################
INSERT INTO `users` (`idusers`, `email`, `password`, `role`) VALUES
('5de20ec1-158e-4f15-8012-3414d8c182a7', 'admin@campusprint.de', '$2a$10$IWDo61g8d4D2qVXpJ/PNk.SxB8bg9hs4/pgewDlVdHT9p4MNbW8fC', 'admin'),
('a5835e04-c027-4493-b40e-ca3eeff921c7', 'student@campusprint.de', NULL, 'user'),
('ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'extern@campusprint.de', NULL, 'user');

-- ########################################################
-- 2. DEVICES
-- ########################################################

INSERT INTO `devices` (`iddevice`, `name`, `description`, `model`, `status`, `type`, `image`, `print_options`, `booking_availability_blocked_weekdays`) VALUES
('5b526244-e177-4ade-a43b-bc3f976dad4a', 'Ultimaker S5',
 'Anfaengerfreundlicher 3D Drucker',
 'S5', 'Available', 'FDM_Printer',
 'https://ultimaker.com/wp-content/uploads/2023/05/The_Ultimaker_S5.jpg',
 '{
    "tech_type": "FDM",
    "work_area": {"x": 330, "y": 240, "z": 300}, 
    "available_materials": [
        {"name": "PLA", "temp_nozzle": 210, "temp_bed": 60, "color_hex": "#FFFFFF"},
        {"name": "Tough PLA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#000000"},
        {"name": "PVA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#FFFFCC"}
    ],
    "supported_layer_heights": [0.06, 0.1, 0.15, 0.2],
    "nozzle_sizes": [0.25, 0.4, 0.8]
 }',
 '{
    "weekdays": [0,2,5]
 }'
),
('2bd7b025-4f26-41ee-ae64-7ef57ae79ccd', 'Prusa MK4',
 'Vielseitiger FDM-3D-Drucker',
 'MK4', 'Unavailable', 'FDM_Printer',
 'assets/prusa.png',
 '{
    "tech_type": "FDM",
    "work_area": {"x": 250, "y": 210, "z": 210},
    "available_materials": [
        {"name": "Prusament PLA", "temp_nozzle": 215, "temp_bed": 60, "color_hex": "#FF5733"},
        {"name": "PETG", "temp_nozzle": 240, "temp_bed": 80, "color_hex": "#33FF57"}
    ],
    "supported_layer_heights": [0.05, 0.1, 0.2, 0.3],
    "nozzle_sizes": [0.4, 0.6]
 }',
 '{
    "weekdays": [1]
 }'
),
('a8e206ed-6dfd-4c98-8c1a-aedae96283f2', 'Bambu Lab X1 Carbon',
 'High-End',
 'X1 Carbon', 'Available', 'FDM_Printer',
 'https://cdn.idealo.com/folder/Product/202800/9/202800985/s1_produktbild_max_1/bambu-lab-x1-carbon-combo.jpg',
 '{
    "tech_type": "FDM",
    "work_area": {"x": 256, "y": 256, "z": 256},
    "available_materials": [
        {"name": "PLA Basic", "temp_nozzle": 220, "temp_bed": 55, "color_hex": "#AAAAAA"},
        {"name": "PAHT-CF", "temp_nozzle": 290, "temp_bed": 100, "color_hex": "#111111"}
    ],
    "supported_layer_heights": [0.08, 0.12, 0.16, 0.2, 0.24],
    "nozzle_sizes": [0.4, 0.6]
 }',
 '{
    "weekdays": []
 }'
),
('d011be88-3e1e-4384-b373-3f0d75971039', 'Formlabs Form 3+', 
 null, 
 'Form 3+', 'Available', 'SLA_Printer',
 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.mos.cms.futurecdn.net%2F5Pfuvxw3XNgQD4YWjeNc2N-1200-80.jpg&f=1&nofb=1&ipt=da15a618dd64a4127be8cbc71fb63532cf09349b66d1eec02c4436d753e7bdad',
 '{
    "tech_type": "SLA",
    "work_area": {"x": 145, "y": 145, "z": 185},
    "available_materials": [
        {"name": "Standard Grey Resin", "color_hex": "#808080"},
        {"name": "Clear Resin", "color_hex": "#E0E0E0"}
    ],
    "supported_layer_heights": [0.025, 0.05, 0.1]
 }',
 '{
    "weekdays": [6]
 }'
),
('d81f12c6-02f3-4e3f-8ac9-f3705473ddbf', 'Epilog Fusion Pro 32',
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
 }',
 '{
    "weekdays": []
 }'
),
('4c817471-57c1-4b00-b340-c72caa9aeccb', 'Trotec Speedy 100',
 'Kleine bis mittelgroßer Objekte'
 ,'Speedy 100', 'Unavailable', 'Laser_Cutter',
 'https://puzzlebox3d.com/wp-content/uploads/2022/05/TRO_Speedy_100_2020_03_right-scaled.webp',
 '{
    "tech_type": "LASER",
    "work_area": {"x": 610, "y": 305},
    "presets": [
        {"material": "Papier/Karton", "thickness": 1, "power": 20, "speed": 60}
    ]
 }',
 '{
    "weekdays": []
 }'
),
('f8a3c7b1-9d2e-4f5a-b6c8-1e4d3a7b9c5f', 'HP DesignJet T650',
 'Großformat-Plotter',
 'T650', 'Available', 'Printer',
 'https://plotterkaufen24.com/wp-content/uploads/2020/10/HP-Designjet-T650-36-Zoll-A0-Drucker.jpg',
 '{
    "tech_type": "PAPER",
    "paper_weights": [80, 90, 120, 180],
    "formats": ["A4", "A3", "A2", "A1", "A0", "Rollenware 24 Zoll"]
 }',
 '{
    "weekdays": []
 }'
);

-- ########################################################
-- 3. PRINT JOBS & BOOKINGS
-- ########################################################

INSERT INTO `print_jobs` (`idprintjob`, `device`, `file_path`, `settings`) VALUES 
('a9cf03d2-c2f6-4589-b9b5-ebf252c45ee3', '5b526244-e177-4ade-a43b-bc3f976dad4a', 'files/job1.gcode',
'{"tech_type": "FDM", "selected_material": {"name": "PLA", "temp_nozzle": 210, "temp_bed": 60, "color_hex": "#FFFFFF"}, "selected_layer_height": 0.2, "selected_nozzle_size": 0.4, "selected_support_type": "none", "selected_infill_percentage": 20}');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES ('a9cf03d2-c2f6-4589-b9b5-ebf252c45ee3', 0, '2025-11-25 10:00:00', '2025-11-25 14:00:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', 'Bachelorarbeit Gehaeuse V3. Bitte weißes PLA nutzen.');

INSERT INTO `print_jobs` (`idprintjob`, `device`, `file_path`, `settings`) VALUES 
('3d9bce52-9202-4383-a838-0a33574fb117', 'd81f12c6-02f3-4e3f-8ac9-f3705473ddbf', 'files/arch.pdf',
'{"tech_type": "LASER", "selected_preset": {"material": "Sperrholz 4mm", "thickness": 4, "power": 90, "speed": 15}}');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES ('3d9bce52-9202-4383-a838-0a33574fb117', 0, '2025-11-26 09:00:00', '2025-11-26 09:30:00', 'ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'Architektur-Modell M 1:50, Sperrholz 4mm.');

INSERT INTO `print_jobs` (`idprintjob`, `device`, `settings`) VALUES 
('31ebb7dd-f6d9-4210-8132-c09ab105e4c7', 'f8a3c7b1-9d2e-4f5a-b6c8-1e4d3a7b9c5f',
'{"tech_type": "PAPER", "selected_format": "A0", "selected_paper_weights": 120}');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES ('31ebb7dd-f6d9-4210-8132-c09ab105e4c7', 0, '2025-11-26 11:00:00', '2025-11-26 11:15:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', '3x A0 Plaene fuer Praesentation.');

INSERT INTO `print_jobs` (`idprintjob`, `device`, `livestream`, `settings`) VALUES 
('e74ca0d3-ce9d-420c-9fbf-2ad55c677af1', '2bd7b025-4f26-41ee-ae64-7ef57ae79ccd', 'https://images.unsplash.com/...',
'{"tech_type": "FDM", "selected_material": {"name": "PETG", "temp_nozzle": 240, "temp_bed": 80, "color_hex": "#33FF57"}, "selected_layer_height": 0.2, "selected_nozzle_size": 0.4, "selected_support_type": "touching_bed", "selected_infill_percentage": 30}');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`)
VALUES ('e74ca0d3-ce9d-420c-9fbf-2ad55c677af1', 2, '2025-11-24 08:00:00', '2025-11-24 12:00:00', 'a5835e04-c027-4493-b40e-ca3eeff921c7', 'Ersatzteile fuer Roboter-AG');

INSERT INTO `print_jobs` (`idprintjob`, `device`) VALUES ('d0f01f02-184a-4895-b7c3-a9e0735b465b', '5b526244-e177-4ade-a43b-bc3f976dad4a');
INSERT INTO `bookings` (`print_job`, `status`, `start_time`, `end_time`, `user_id`, `user_notes`, `admin_message`)
VALUES ('d0f01f02-184a-4895-b7c3-a9e0735b465b', 3, '2025-11-19 14:00:00', '2025-11-19 18:00:00', 'ecb1af1e-0f2b-4882-ab1f-5fee1ffccdf3', 'Privatprojekt', 'Drucken von Waffen-Repliken ist laut Nutzungsordnung untersagt.');
