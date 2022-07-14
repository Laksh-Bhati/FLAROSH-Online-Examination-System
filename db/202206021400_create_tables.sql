CREATE TABLE user (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(16) UNIQUE,
    hall_ticket_no VARCHAR(12) NOT NULL,
    university VARCHAR(256) NOT NULL,
    course VARCHAR(16) NOT NULL,
    email VARCHAR(256) UNIQUE,
    password VARCHAR(256) NOT NULL
);