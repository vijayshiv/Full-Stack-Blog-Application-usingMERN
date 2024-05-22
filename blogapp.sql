-- User registration table
CREATE TABLE register (
id INT PRIMARY KEY AUTO_INCREMENT,
fullname VARCHAR(100),
email VARCHAR(100),
password VARCHAR(100),
isDeleted INT(1) DEFAULT 0,
createdTimestamp DATETIME default CURRENT_TIMESTAMP
);