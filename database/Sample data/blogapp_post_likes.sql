DROP TABLE IF EXISTS `post_likes`;
CREATE TABLE `post_likes` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `post_likes` VALUES (1,2),(1,4),(1,5),(1,7),(1,9),(1,10),(1,14),(1,16),(1,18),(1,22),(1,23),(1,24),(1,25),(2,7),(2,24),(3,7),(3,10),(4,21),(5,5),(5,6),(5,7),(5,10),(5,11),(5,19),(5,22),(5,23),(5,25),(7,5),(7,23),(8,4),(8,26);
