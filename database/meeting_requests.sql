-- Meeting Requests Table
CREATE TABLE IF NOT EXISTS meeting_requests (
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
  
  -- Foreign Keys
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  
  -- Indexes for better performance
  INDEX idx_requester_id (requester_id),
  INDEX idx_author_id (author_id),
  INDEX idx_post_id (post_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  
  -- Ensure no duplicate pending/approved requests for same post
  UNIQUE KEY unique_active_request (requester_id, author_id, post_id, status)
);

-- Add some sample data for testing (optional)
INSERT INTO meeting_requests (requester_id, author_id, post_id, post_title, message, status) VALUES
(2, 1, 1, 'Sample Post Title', 'Hi! I really enjoyed your post about web development and would love to discuss some ideas with you. Would you be interested in a quick video call to share thoughts on modern frameworks?', 'pending'),
(3, 1, 2, 'Another Post Title', 'Your insights on React were fantastic! I am working on a similar project and would appreciate your guidance. Could we schedule a meeting?', 'approved'),
(1, 2, 3, 'Third Post Title', 'I found your article very helpful and have some questions. Would you be available for a video meeting to discuss further?', 'declined')
ON DUPLICATE KEY UPDATE id=id;
