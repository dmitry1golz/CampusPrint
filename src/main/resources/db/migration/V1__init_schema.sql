CREATE TABLE device_types
(
    name VARCHAR(50) PRIMARY KEY
);

INSERT INTO device_types (name)
VALUES ('FDM_Drucker'),
       ('SLA_Drucker'),
       ('Lasercutter'),
       ('CNC_Fräse'),
       ('Papierdrucker');


CREATE TABLE device_statuses
(
    name VARCHAR(50) PRIMARY KEY
);

INSERT INTO device_statuses (name)
VALUES ('Verfügbar'),
       ('Wartung'),
       ('Defekt');


CREATE TABLE booking_statuses
(
    name VARCHAR(50) PRIMARY KEY
);

INSERT INTO booking_statuses (name)
VALUES ('PENDING'),
       ('APPROVED'),
       ('REJECTED'),
       ('COMPLETED'),
       ('CANCELLED');



CREATE TABLE users
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255)              NOT NULL UNIQUE,
    first_name VARCHAR(100)              NOT NULL,
    last_name  VARCHAR(100)              NOT NULL,
    role       ENUM ('STUDENT', 'ADMIN') NOT NULL
);


CREATE TABLE devices
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    type       VARCHAR(50)  NOT NULL,
    status     VARCHAR(50)  NOT NULL,

    CONSTRAINT fk_device_type
        FOREIGN KEY (type) REFERENCES device_types (name),

    CONSTRAINT fk_device_status
        FOREIGN KEY (status) REFERENCES device_statuses (name)
);


CREATE TABLE bookings
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_time   DATETIME    NOT NULL,
    end_time     DATETIME    NOT NULL,
    project_name VARCHAR(255),
    status       VARCHAR(50) NOT NULL,

    student_id   BIGINT      NOT NULL,
    admin_id     BIGINT,
    device_id    BIGINT      NOT NULL,

    CONSTRAINT fk_booking_status
        FOREIGN KEY (status) REFERENCES booking_statuses (name),

    CONSTRAINT fk_booking_student
        FOREIGN KEY (student_id) REFERENCES users (id),

    CONSTRAINT fk_booking_admin
        FOREIGN KEY (admin_id) REFERENCES users (id),

    CONSTRAINT fk_booking_device
        FOREIGN KEY (device_id) REFERENCES devices (id)
);


CREATE TABLE print_jobs
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id   BIGINT UNIQUE,

    file_path    VARCHAR(500) NOT NULL,
    material     VARCHAR(100),
    layer_height DOUBLE,
    infill       INT,
    livestream   BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_print_job_booking
        FOREIGN KEY (booking_id)
            REFERENCES bookings (id)
            ON DELETE CASCADE
);
