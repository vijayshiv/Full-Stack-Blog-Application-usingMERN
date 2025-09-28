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
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'comment',
  `message` text NOT NULL,
  `related_post_id` int DEFAULT NULL,
  `related_comment_id` int DEFAULT NULL,
  `read_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `related_post_id` (`related_post_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_read_status` (`read_status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_read` (`user_id`,`read_status`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`related_post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (16,5,'reply','Someone replied to your comment: \"Yes!!\"',19,25,0,'2025-07-24 11:22:17'),(30,10,'reply','Someone replied to your comment: \"thanks\"',4,76,1,'2025-08-06 15:36:30'),(31,10,'meeting_approve','Author has approved your meeting request about \"Sushi Bake\". The meeting room is ready!',5,NULL,1,'2025-08-06 15:37:16'),(33,11,'meeting_approve','Author has approved your meeting request about \"What is a demo experience platform?\". The meeting room is ready!',6,NULL,1,'2025-08-06 19:29:15'),(35,11,'meeting_approve','Author has approved your meeting request about \"Sushi Bake\". The meeting room is ready!',7,NULL,0,'2025-08-06 19:40:26'),(36,5,'comment','Someone commented on your post: \"Cutiee♥️\"',19,NULL,0,'2025-08-11 19:15:49'),(37,5,'comment','Someone commented on your post: \"Good\"',19,NULL,0,'2025-08-11 19:21:07'),(38,5,'comment','Someone commented on your post: \"Nice\"',19,NULL,0,'2025-08-11 19:22:50'),(41,5,'reply','Someone replied to your comment: \"What is this comment?\"',11,16,0,'2025-08-12 19:14:50'),(42,5,'comment','Someone commented on your post: \"NIce post!!!\"',19,NULL,0,'2025-08-12 19:30:25'),(44,10,'comment','Someone commented on your post: \"Nice post Ritika!!! ♥️\"',30,NULL,1,'2025-08-13 11:22:32'),(45,1,'reply','Someone replied to your comment: \"Thansks!! Vj\"',30,87,1,'2025-08-13 11:23:14'),(49,1,'meeting_request','Someone wants to meet with you about \"Actor Sylvester Stallone Movie - Rocky (1976)\": Hey, let\'s connect',8,NULL,1,'2025-09-22 20:23:54'),(51,1,'meeting_request','Someone wants to meet with you about \"Rethinking AI Priorities: Lessons From IBM Think and Intel’s Lunar Lake\": Hey, are you free to connect?',9,NULL,1,'2025-09-22 20:28:09'),(53,1,'meeting_request','Someone wants to meet with you about \"What is a demo experience platform?\": Hey lets connect',10,NULL,1,'2025-09-22 20:31:01'),(55,1,'meeting_request','Someone wants to meet with you about \"How Much Energy Would It Take to Pull Carbon Dioxide out of the Air?\": Hey how are you',11,NULL,1,'2025-09-22 20:37:05'),(57,1,'meeting_request','Someone wants to meet with you about \"What is a demo experience platform?\": Hey lets connect',12,NULL,1,'2025-09-22 20:42:36'),(58,3,'meeting_approve','Author has approved your meeting request about \"What is a demo experience platform?\". The meeting room is ready!',12,NULL,0,'2025-09-22 20:42:44');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-28 21:26:13
