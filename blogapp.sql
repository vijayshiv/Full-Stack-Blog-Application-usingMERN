-- User registration table
CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
fullname VARCHAR(100),
email VARCHAR(100),
password VARCHAR(100),
isDeleted INTEGER(1) DEFAULT 0,
createdTimestamp DATETIME default CURRENT_TIMESTAMP
);

-- Post table 
CREATE TABLE posts(
post_id INT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(100),
content VARCHAR(4096),
img VARCHAR(255),
category VARCHAR(20),
user_id INT REFERENCES users(id), 
isDeleted INTEGER(1) DEFAULT 0,
createdTimestamp DATETIME default CURRENT_TIMESTAMP
);

USE blogapp;
SELECT * FROM users;
SELECT * FROM posts;





