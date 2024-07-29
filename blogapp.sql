CREATE DATABASE blogapp;
USE blogapp;

-- User registration table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100),
    isDeleted INTEGER(1) DEFAULT 0,
    createdTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255), 
    reset_token_expiration DATETIME 
);

-- Post table 
CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    content TEXT,
    img VARCHAR(255),
    category VARCHAR(20),
    user_id INT,
    isDeleted INTEGER(1) DEFAULT 0,
    createdTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,  -- Added column
    FOREIGN KEY (user_id) REFERENCES users(id) 
);

-- Post likes table
CREATE TABLE post_likes (
    user_id INT,
    post_id INT,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id), 
    FOREIGN KEY (post_id) REFERENCES posts(post_id) 
);

-- Comments table
CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    createdTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Example SELECT statements to view data
SELECT * FROM users;
SELECT * FROM posts;
SELECT * FROM comments;
SELECT * FROM post_likes;
