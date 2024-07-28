CREATE DATABASE blogapp;
USE blogapp;

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
CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    content TEXT,
    img VARCHAR(255),
    category VARCHAR(20),
    user_id INT REFERENCES users(id),
    isDeleted INTEGER(1) DEFAULT 0,
    createdTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add likes field to posts table
ALTER TABLE posts ADD COLUMN likes INT DEFAULT 0;

CREATE TABLE post_likes (
  user_id INT,
  post_id INT,
  PRIMARY KEY (user_id, post_id)
);

-- Create comments table
CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT REFERENCES posts(post_id),
    user_id INT REFERENCES users(id),
    content TEXT,
    createdTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM users;
SELECT * FROM posts;
SELECT * FROM comments;
SELECT * FROM post_likes;



