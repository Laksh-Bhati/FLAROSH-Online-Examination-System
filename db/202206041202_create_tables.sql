CREATE table question (
    id VARCHAR(36) primary KEY,
    serial_no int(3) not NULl,
    subject VARCHAR(64) NOT NULL,
    question varchar(1024) NOT NULL,
    option1 varchar(256) not NULL,
    option2 varchar(256) not NULL,
    option3 varchar(256) not NULL,
    option4 varchar(256) not NULL,
    correct_option int(1) not NULL
);

CREATE table response (
    id VARCHAR(36) primary KEY,
    user_id varchar(36) not NULl,
    question_id varchar(36) NOT NULL,
    selected_option int(1) not NULL
); 

!-- add foreign key user_id and question_id
!-- make (user_id, question_id) pair unique

