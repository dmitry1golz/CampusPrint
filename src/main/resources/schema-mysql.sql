-- ########################################################
-- CAMPUSPRINT DATABASE SCHEMA (MariaDB)
-- ########################################################

-- Set engine and charset
SET default_storage_engine=InnoDB;
SET NAMES utf8mb4;

-- ########################################################
-- 1. USERS TABLE
-- ########################################################
CREATE TABLE IF NOT EXISTS `users` (
  `idusers` VARCHAR(36) NOT NULL,
  `email` VARCHAR(60) NOT NULL,
  `password` VARCHAR(100) DEFAULT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`idusers`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ########################################################
-- 2. DEVICES TABLE
-- ########################################################
CREATE TABLE IF NOT EXISTS `devices` (
  `iddevice` VARCHAR(36) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(300) DEFAULT NULL,
  `model` VARCHAR(60) DEFAULT NULL,
  `type` ENUM('FDM_Printer', 'SLA_Printer', 'Laser_Cutter', 'Printer') DEFAULT NULL,
  `status` ENUM('Available', 'Unavailable') NOT NULL DEFAULT 'Unavailable',
  `print_options` TEXT DEFAULT NULL COMMENT 'JSON data: DeviceOptions',
  `image` VARCHAR(255) DEFAULT NULL,
  `booking_availability_blocked_weekdays` TEXT DEFAULT NULL COMMENT 'JSON data: BlockedWeekdays',
  PRIMARY KEY (`iddevice`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ########################################################
-- 3. PRINT JOBS TABLE
-- ########################################################
CREATE TABLE IF NOT EXISTS `print_jobs` (
  `idprintjob` VARCHAR(36) NOT NULL,
  `device` VARCHAR(36) DEFAULT NULL,
  `settings` TEXT DEFAULT NULL COMMENT 'JSON data: PrintJobSelectedOptions',
  `file_path` VARCHAR(45) DEFAULT NULL,
  `livestream` VARCHAR(60) DEFAULT NULL,
  PRIMARY KEY (`idprintjob`),
  CONSTRAINT `fk_print_jobs_device`
    FOREIGN KEY (`device`) REFERENCES `devices` (`iddevice`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create index for faster device lookups
CREATE INDEX IF NOT EXISTS `idx_print_jobs_device` ON `print_jobs` (`device`);

-- ########################################################
-- 4. BOOKINGS TABLE
-- ########################################################
CREATE TABLE IF NOT EXISTS `bookings` (
  `idbooking` INT AUTO_INCREMENT,
  `user_id` VARCHAR(36) NOT NULL,
  `print_job` VARCHAR(36) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` ENUM('pending', 'confirmed', 'completed', 'rejected', 'running') NOT NULL,
  `user_notes` VARCHAR(300) DEFAULT NULL,
  `admin_message` VARCHAR(300) DEFAULT NULL,
  `lastModifiedBy` VARCHAR(36) DEFAULT NULL,
  `last_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idbooking`),
  CONSTRAINT `fk_bookings_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`idusers`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_print_job`
    FOREIGN KEY (`print_job`) REFERENCES `print_jobs` (`idprintjob`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_last_modified_by`
    FOREIGN KEY (`lastModifiedBy`) REFERENCES `users` (`idusers`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS `idx_bookings_user` ON `bookings` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_bookings_print_job` ON `bookings` (`print_job`);
CREATE INDEX IF NOT EXISTS `idx_bookings_status` ON `bookings` (`status`);
CREATE INDEX IF NOT EXISTS `idx_bookings_start_time` ON `bookings` (`start_time`);
CREATE INDEX IF NOT EXISTS `idx_bookings_end_time` ON `bookings` (`end_time`);

-- ########################################################
-- COMPLETED
-- ########################################################
