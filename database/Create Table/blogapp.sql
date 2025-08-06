CREATE DATABASE IF NOT EXISTS blogapp;
USE blogapp;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100),
    isDeleted TINYINT(1) DEFAULT 0,
    createdTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiration DATETIME
);

-- Posts table
CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    content TEXT,
    img VARCHAR(255),
    category VARCHAR(20),
    user_id INT,
    isDeleted TINYINT(1) DEFAULT 0,
    createdTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
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

-- Comments table with threading support
CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    createdTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_comment_id INT DEFAULT NULL,
    reply_count INT DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- Indexes for comments threading
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_post_parent ON comments(post_id, parent_comment_id);

-- Meeting requests table
CREATE TABLE meeting_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    author_id INT NOT NULL,
    post_id INT NOT NULL,
    post_title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'approved', 'declined', 'completed') DEFAULT 'pending',
    meeting_url VARCHAR(500) NULL,
    scheduled_time DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    UNIQUE KEY unique_active_request (requester_id, author_id, post_id, status),
    INDEX idx_requester_id (requester_id),
    INDEX idx_author_id (author_id),
    INDEX idx_post_id (post_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'comment',
    message TEXT NOT NULL,
    related_post_id INT NULL,
    related_comment_id INT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_read_status (read_status),
    INDEX idx_created_at (created_at),
    INDEX idx_user_read (user_id, read_status)
);

-- Example SELECT statements to view data
SELECT * FROM users;
SELECT * FROM posts;
SELECT * FROM comments;
SELECT * FROM post_likes;
SELECT * FROM meeting_requests;
SELECT * FROM notifications;