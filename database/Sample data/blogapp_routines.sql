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
-- Temporary view structure for view `comment_threads`
--

DROP TABLE IF EXISTS `comment_threads`;
/*!50001 DROP VIEW IF EXISTS `comment_threads`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `comment_threads` AS SELECT 
 1 AS `comment_id`,
 1 AS `post_id`,
 1 AS `user_id`,
 1 AS `content`,
 1 AS `createdTimestamp`,
 1 AS `parent_comment_id`,
 1 AS `reply_count`,
 1 AS `user_name`,
 1 AS `depth_level`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `comment_threads`
--

/*!50001 DROP VIEW IF EXISTS `comment_threads`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `comment_threads` AS select `c`.`comment_id` AS `comment_id`,`c`.`post_id` AS `post_id`,`c`.`user_id` AS `user_id`,`c`.`content` AS `content`,`c`.`createdTimestamp` AS `createdTimestamp`,`c`.`parent_comment_id` AS `parent_comment_id`,`c`.`reply_count` AS `reply_count`,`u`.`fullname` AS `user_name`,(case when (`c`.`parent_comment_id` is null) then 0 else 1 end) AS `depth_level` from (`comments` `c` join `users` `u` on((`c`.`user_id` = `u`.`id`))) where (`u`.`isDeleted` = 0) order by `c`.`post_id`,coalesce(`c`.`parent_comment_id`,`c`.`comment_id`),`c`.`createdTimestamp` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-28 21:26:14
