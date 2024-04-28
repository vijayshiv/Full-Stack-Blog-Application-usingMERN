CREATE TABLE register(
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName CHAR(15),
    lastName CHAR(15),
    email VARCHAR(50),
    password CHAR(200),
    phone CHAR(15),
    isDeleted integer(1) default 0,
    createdTimestamp DATETIME default CURRENT_TIMESTAMP
);