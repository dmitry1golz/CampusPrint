-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mariadb
-- Erstellungszeit: 12. Jan 2026 um 18:03
-- Server-Version: 11.5.2-MariaDB-ubu2404
-- PHP-Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `CampusPrint`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `bookings`
--

CREATE TABLE `bookings` (
  `idbooking` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL CHECK (`status` between 0 and 4),
  `end_time` datetime(6) NOT NULL,
  `last_modified` datetime(6) DEFAULT NULL,
  `start_time` datetime(6) NOT NULL,
  `last_modified_by` varchar(36) DEFAULT NULL,
  `print_job` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `admin_message` varchar(300) DEFAULT NULL,
  `user_notes` varchar(300) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `devices`
--

CREATE TABLE `devices` (
  `iddevice` uuid NOT NULL,
  `name` varchar(45) NOT NULL,
  `model` varchar(60) DEFAULT NULL,
  `description` varchar(300) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `booking_availability_blocked_weekdays` text DEFAULT NULL,
  `print_options` text DEFAULT NULL,
  `status` enum('Available','Unavailable') NOT NULL DEFAULT 'Unavailable',
  `type` enum('FDM_Printer','SLA_Printer','Laser_Cutter','Printer') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `print_jobs`
--

CREATE TABLE `print_jobs` (
  `device` uuid DEFAULT NULL,
  `idprintjob` varchar(36) NOT NULL,
  `file_path` varchar(45) DEFAULT NULL,
  `livestream` varchar(60) DEFAULT NULL,
  `settings` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `idusers` varchar(36) NOT NULL,
  `email` varchar(60) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`idbooking`),
  ADD KEY `FKqg03jsdjcgcxv5a5dtm1og3fq` (`last_modified_by`),
  ADD KEY `FKt2lu3hvqy1ae9gf6ki2ic8b84` (`print_job`),
  ADD KEY `FKeyog2oic85xg7hsu2je2lx3s6` (`user_id`);

--
-- Indizes für die Tabelle `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`iddevice`);

--
-- Indizes für die Tabelle `print_jobs`
--
ALTER TABLE `print_jobs`
  ADD PRIMARY KEY (`idprintjob`),
  ADD KEY `FKqo4i7qrn3b3i8t99aw82f7v8a` (`device`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`idusers`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `bookings`
--
ALTER TABLE `bookings`
  MODIFY `idbooking` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `FKeyog2oic85xg7hsu2je2lx3s6` FOREIGN KEY (`user_id`) REFERENCES `users` (`idusers`),
  ADD CONSTRAINT `FKqg03jsdjcgcxv5a5dtm1og3fq` FOREIGN KEY (`last_modified_by`) REFERENCES `users` (`idusers`),
  ADD CONSTRAINT `FKt2lu3hvqy1ae9gf6ki2ic8b84` FOREIGN KEY (`print_job`) REFERENCES `print_jobs` (`idprintjob`);

--
-- Constraints der Tabelle `print_jobs`
--
ALTER TABLE `print_jobs`
  ADD CONSTRAINT `FKqo4i7qrn3b3i8t99aw82f7v8a` FOREIGN KEY (`device`) REFERENCES `devices` (`iddevice`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
