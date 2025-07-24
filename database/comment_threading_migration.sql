-- Migration for comment threading support
-- Add parent_comment_id column to support nested comments

USE blogapp;

-- Add parent_comment_id column to comments table
ALTER TABLE comments 
ADD COLUMN parent_comment_id INT DEFAULT NULL,
ADD COLUMN reply_count INT DEFAULT 0,
ADD CONSTRAINT fk_parent_comment 
FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE;

-- Add index for better performance on threaded queries
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_post_parent ON comments(post_id, parent_comment_id);

-- Update existing comments to have parent_comment_id as NULL (top-level comments)
-- This is already the default, but making it explicit
UPDATE comments SET parent_comment_id = NULL WHERE parent_comment_id IS NULL;

-- Add a view for easier comment tree queries
CREATE VIEW comment_threads AS
SELECT 
    c.comment_id,
    c.post_id,
    c.user_id,
    c.content,
    c.createdTimestamp,
    c.parent_comment_id,
    c.reply_count,
    u.fullname as user_name,
    CASE 
        WHEN c.parent_comment_id IS NULL THEN 0 
        ELSE 1 
    END as depth_level
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE u.isDeleted = 0
ORDER BY 
    c.post_id,
    COALESCE(c.parent_comment_id, c.comment_id),
    c.createdTimestamp ASC;
