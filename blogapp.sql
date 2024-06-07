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
CREATE TABLE g(
post_id INT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(100),
content VARCHAR(1000),
img VARCHAR(255),
user_id INT REFERENCES users(id), 
isDeleted INTEGER(1) DEFAULT 0,
createdTimestamp DATETIME default CURRENT_TIMESTAMP
);

INSERT INTO posts(title, content, img, user_id) VALUES('Products Reviews','When it comes to the most popular types of blog posts to incorporate into a content marketing campaign, listicles come in pretty close to the top, and with good reason.To begin with, everyone loves a good list. Lists are organized, easy to digest, and easy to share via social media, email, and more.','https://images.pexels.com/photos/7008010/pexels-photo-7008010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',2);

USE blogapp;
SELECT * FROM users;
SELECT * FROM posts;
desc posts;
desc g;


