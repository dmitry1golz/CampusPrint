-- Order: users -> devices -> print_jobs -> bookings (FKs)


-- USERS --
create table if not exists users
(
    idusers  char(36)              not null,
    email    varchar(60)           not null,
    password varchar(100)          null,
    role     enum ('user','admin') not null default 'user',
    primary key (idusers),
    unique key uk_users_email (email)
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_unicode_ci;


 -- DEVICES --
create table if not exists devices
(
    iddevice      int                              not null auto_increment,
    name          varchar(45)                      not null,
    description   varchar(300)                     null,
    model         varchar(60)                      null,


    type          enum ('FDM_Printer',
                        'SLA_Printer',
                        'Laser_Cutter',
                        'CNC_Mill',
                        'Printer')                 null,

    status        enum ('Available',
                        'Unavailable')
                        not null default 'Unavailable',

    -- In the entity, it is TEXT, although logically it is JSON.
    print_options text                             null,

    image         varchar(255)                     null,

    primary key (iddevice),
    key idx_devices_status (status),
    key idx_devices_type (type)
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_unicode_ci;


-- PRINT_JOBS --
create table if not exists print_jobs
(
    idprintjob int         not null auto_increment,

    device     int         not null,
    settings   json        null,

    file_path  varchar(45) null,
    livestream varchar(60) null,

    primary key (idprintjob),
    key idx_print_jobs_device (device),
    constraint fk_print_jobs_device
        foreign key (device) references devices (iddevice)
            on delete restrict
            on update cascade
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_unicode_ci;


-- BOOKINGS --
create table if not exists bookings
(
    idbooking      int          not null auto_increment,

    user_id        char(36)     not null,
    print_job      int          not null,

    start_time     datetime(6)  not null,
    end_time       datetime(6)  not null,

    -- BookingStatus: pending, confirmed, rejected, running
    status         enum('pending',
                        'confirmed',
                        'rejected',
                        'running')
                        not null default 'pending',

    user_notes     varchar(300) null,
    admin_message  varchar(300) null,

    lastModifiedBy char(36)     null,
    last_modified  datetime(6)  null,

    primary key (idbooking),

    key idx_bookings_user (user_id),
    key idx_bookings_print_job (print_job),
    key idx_bookings_status (status),
    key idx_bookings_last_modified_by (lastModifiedBy),

    constraint fk_bookings_user
        foreign key (user_id) references users (idusers)
            on delete restrict
            on update cascade,

    constraint fk_bookings_print_job
        foreign key (print_job) references print_jobs (idprintjob)
            on delete restrict
            on update cascade,

    constraint fk_bookings_last_modified_by
        foreign key (lastModifiedBy) references users (idusers)
            on delete set null
            on update cascade
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_unicode_ci;
