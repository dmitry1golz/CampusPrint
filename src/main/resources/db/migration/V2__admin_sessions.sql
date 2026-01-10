create table if not exists admin_session
(
    token      varchar(64) not null,
    user_id    char(36)    not null,
    created_at timestamp   not null default current_timestamp,

    primary key (token),
    key idx_admin_session_user (user_id),

    constraint fk_admin_session_user
        foreign key (user_id) references users (idusers)
            on delete cascade
            on update cascade
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_unicode_ci;
