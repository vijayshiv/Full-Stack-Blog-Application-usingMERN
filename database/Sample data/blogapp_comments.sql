-- MySQL dump 10.13  Distrib 8.0.42, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: blogapp
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `createdTimestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `parent_comment_id` int DEFAULT NULL,
  `reply_count` int DEFAULT '0',
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_comments_parent_id` (`parent_comment_id`),
  KEY `idx_comments_post_parent` (`post_id`,`parent_comment_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_parent_comment` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (7,23,5,'Awsome post that you have created','2024-07-29 05:19:46',NULL,0),(8,5,5,'The first rule of fight club is that you dont talk about fight club','2024-07-29 05:23:04',NULL,0),(9,5,2,'Tyler Durden is back!!!','2024-07-29 05:39:35',NULL,0),(10,24,1,'The best news that we can get now is this only','2024-07-29 06:15:08',NULL,0),(11,16,1,'There is no tomorrow!!','2024-07-29 06:28:12',NULL,0),(12,23,1,'This is god practice and learning!!!','2024-07-29 16:53:33',NULL,0),(16,11,5,'asdasdasdasd','2024-07-29 20:57:05',NULL,1),(19,6,5,'assdasdasd','2024-07-29 21:14:57',NULL,0),(20,25,5,'What is the best advice you can give to us','2024-07-29 21:33:16',NULL,0),(23,16,3,'what\'s the matter with you!!! Rock ','2024-07-29 22:48:20',NULL,0),(24,5,7,'Nishask cool boi','2024-07-29 23:35:01',NULL,0),(25,19,5,'Nice post...!\nLavanders are very beautiful','2024-07-29 23:49:27',NULL,1),(26,26,8,'Nice piece Keep it up','2024-07-30 02:53:12',NULL,0),(27,2,1,'nice post eshwar..!!!','2024-07-30 03:02:20',NULL,0),(28,11,1,'Nice Dish','2025-07-22 09:01:05',NULL,0),(30,5,1,'Nice!!','2025-07-24 00:30:56',NULL,0),(31,14,1,'Good working fine now!!','2025-07-24 00:44:38',NULL,1),(32,7,9,'Nice Post!! Nishank♥️','2025-07-24 02:03:50',NULL,3),(33,7,9,'Test comment via curl','2025-07-24 13:00:29',NULL,0),(34,7,9,'Test reply via curl','2025-07-24 13:01:50',32,0),(35,7,9,'Test comment from backend test - 2025-07-24T07:32:10.821Z','2025-07-24 13:02:10',NULL,0),(36,7,9,'Test reply from backend test - 2025-07-24T07:32:10.831Z','2025-07-24 13:02:10',32,0),(37,7,9,'Test comment from backend test - 2025-07-24T07:33:14.777Z','2025-07-24 13:03:14',NULL,0),(38,7,9,'Test reply from backend test - 2025-07-24T07:33:14.813Z','2025-07-24 13:03:14',32,0),(39,9,9,'Nice Post!!','2025-07-24 13:51:32',NULL,6),(49,9,9,'If anyone want to connect. Please email me!','2025-07-24 14:14:49',39,0),(50,9,7,'I want to connect!','2025-07-24 14:15:22',39,0),(54,9,7,'Hey','2025-07-24 14:23:06',39,0),(55,14,7,'That\'s great!!!','2025-07-24 15:16:48',31,0),(65,10,7,'What is this pottie','2025-07-24 16:14:21',NULL,1),(66,10,1,'How did you say it pottie?','2025-07-24 16:14:38',65,0),(67,15,7,'Hey!','2025-07-24 16:23:36',NULL,3),(68,15,1,'Hey','2025-07-24 16:23:47',67,0),(69,15,7,'Or bhai vijay sb shi?','2025-07-24 16:25:44',67,0),(70,15,1,'Hnn!! ajay bhai','2025-07-24 16:26:04',67,0),(71,19,1,'Yes!!','2025-07-24 16:52:17',25,0),(72,10,2,'Nice Dish!!','2025-07-25 16:21:09',NULL,2),(73,10,1,'Thanks!!','2025-07-25 16:21:50',72,0),(74,14,2,'Awsm post','2025-08-06 17:54:54',NULL,1),(75,14,1,'Thanks!','2025-08-06 17:55:37',74,0),(76,4,10,'Nice recepie!!','2025-08-06 19:28:29',NULL,1),(77,4,1,'thanks','2025-08-06 21:06:30',76,0),(80,19,2,'Nice','2025-08-12 00:52:50',NULL,1),(82,13,2,'Hiii','2025-08-13 00:41:45',NULL,0),(83,11,2,'What is this comment?','2025-08-13 00:44:50',16,0),(84,17,2,'Nice Post!!\nAI is going to take over','2025-08-13 00:47:11',NULL,0),(85,19,10,'NIce post!!!','2025-08-13 01:00:25',NULL,0),(86,19,10,'You are right!','2025-08-13 01:00:33',80,0),(87,30,1,'Nice post Ritika!!! ♥️','2025-08-13 16:52:32',NULL,1),(88,30,10,'Thansks!! Vj','2025-08-13 16:53:14',87,0),(89,10,4,'I like it!!?','2025-08-15 19:33:46',72,0),(91,1,1,'nice blog','2025-09-19 19:33:19',NULL,0);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-28 21:26:14
