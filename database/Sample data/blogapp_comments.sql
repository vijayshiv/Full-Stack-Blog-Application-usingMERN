DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `createdTimestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `comments` VALUES (7,23,5,'Awsome post that you have created','2024-07-29 05:19:46'),(8,5,5,'The first rule of fight club is that you dont talk about fight club','2024-07-29 05:23:04'),(9,5,2,'Tyler Durden is back!!!','2024-07-29 05:39:35'),(10,24,1,'The best news that we can get now is this only','2024-07-29 06:15:08'),(11,16,1,'There is no tomorrow','2024-07-29 06:28:12'),(12,23,1,'This is god practice and learning!!!','2024-07-29 16:53:33'),(16,11,5,'asdasdasdasd','2024-07-29 20:57:05'),(19,6,5,'assdasdasd','2024-07-29 21:14:57'),(20,25,5,'What is the best advice you can give to us','2024-07-29 21:33:16'),(23,16,3,'what\'s the matter with you!!! Rock ','2024-07-29 22:48:20'),(24,5,7,'Nishask cool boi','2024-07-29 23:35:01'),(25,19,5,'Nice post...!\nLavanders are very beautiful','2024-07-29 23:49:27'),(26,26,8,'Nice piece Keep it up','2024-07-30 02:53:12'),(27,2,1,'nice post eshwar..!!!','2024-07-30 03:02:20');
