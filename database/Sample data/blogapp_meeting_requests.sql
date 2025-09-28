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
-- Table structure for table `meeting_requests`
--

DROP TABLE IF EXISTS `meeting_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requester_id` int NOT NULL,
  `author_id` int NOT NULL,
  `post_id` int NOT NULL,
  `post_title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('pending','approved','declined','completed') DEFAULT 'pending',
  `meeting_url` varchar(500) DEFAULT NULL,
  `scheduled_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_active_request` (`requester_id`,`author_id`,`post_id`,`status`),
  KEY `idx_requester_id` (`requester_id`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `meeting_requests_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meeting_requests_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meeting_requests_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting_requests`
--

LOCK TABLES `meeting_requests` WRITE;
/*!40000 ALTER TABLE `meeting_requests` DISABLE KEYS */;
INSERT INTO `meeting_requests` VALUES (1,7,1,10,'Instant Pot Cauliflower Curry','Hi! this is really cool recipe that I saw on you post. I have few things to make it more delicious!! Looking forward to call','approved','http://localhost:3000/meeting/1',NULL,'2025-07-25 02:57:49','2025-07-25 03:13:26'),(2,7,1,8,'Rethinking AI Priorities: Lessons From IBM Think and Intel’s Lunar Lake','Hey looks good to meet','approved','http://localhost:5173/meeting/2',NULL,'2025-07-25 03:39:39','2025-07-25 03:39:45'),(3,2,1,10,'Instant Pot Cauliflower Curry','I actually liked this post','completed','http://localhost:5173/meeting/3',NULL,'2025-07-25 16:21:25','2025-07-25 16:28:49'),(4,2,1,14,'HOW LEONARDO DICAPRIO BECAME A CLIMATE ACTIVIST','I like this post a lot','pending',NULL,NULL,'2025-08-06 17:54:33','2025-08-06 17:54:33'),(5,10,1,4,'Sushi Bake','I like to meet you','completed','http://localhost:5173/meeting/5',NULL,'2025-08-06 19:28:39','2025-08-06 21:08:34'),(6,11,1,3,'What is a demo experience platform?','hi  can i have video chat ithh you','approved','http://localhost:5173/meeting/6',NULL,'2025-08-07 00:57:35','2025-08-07 00:59:15'),(7,11,1,4,'Sushi Bake','hi pls meet','approved','http://192.168.0.131:5173/meeting/7',NULL,'2025-08-07 01:10:10','2025-08-07 01:10:26'),(8,2,1,16,'Actor Sylvester Stallone Movie - Rocky (1976)','Hey, let\'s connect','completed','http://localhost:5173/meeting/8',NULL,'2025-09-23 01:53:54','2025-09-23 01:54:36'),(9,2,1,8,'Rethinking AI Priorities: Lessons From IBM Think and Intel’s Lunar Lake','Hey, are you free to connect?','declined',NULL,NULL,'2025-09-23 01:58:09','2025-09-23 02:00:19'),(10,7,1,3,'What is a demo experience platform?','Hey lets connect','approved','http://192.168.1.48:5173/meeting/10',NULL,'2025-09-23 02:01:01','2025-09-23 02:01:17'),(11,7,1,15,'How Much Energy Would It Take to Pull Carbon Dioxide out of the Air?','Hey how are you','approved','http://192.168.1.48:5173/meeting/11',NULL,'2025-09-23 02:07:05','2025-09-23 02:07:16'),(12,3,1,3,'What is a demo experience platform?','Hey lets connect','approved','http://192.168.1.48:5173/meeting/12',NULL,'2025-09-23 02:12:36','2025-09-23 02:12:44');
/*!40000 ALTER TABLE `meeting_requests` ENABLE KEYS */;
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
