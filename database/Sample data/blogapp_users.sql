DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `isDeleted` int DEFAULT '0',
  `createdTimestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiration` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `users` VALUES (1,'Vijay Shiv','vijay.shiv04@gmail.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',0,'2024-06-09 15:46:56',NULL,NULL),(2,'Eshwar Inamdar','e@gmail.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',0,'2024-06-09 16:14:39',NULL,NULL),(3,'Nishank Kose','n@gmail.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',0,'2024-06-09 18:44:33',NULL,NULL),(4,'sahil kathpal','s@gmail.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',0,'2024-07-04 18:31:28',NULL,NULL),(5,'devesh sharma','deveshsharma372002@gmail.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',0,'2024-07-27 21:11:50','bfb6a15ce549213f87c39578e75850fbc4f9d72e6ce1cb675716521ce506d2e5','2024-07-30 03:20:54'),(6,'sarthak singh','rj@gmail.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',0,'2024-07-29 05:32:48',NULL,NULL),(7,'ajay gayke','a@gmail.com','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',0,'2024-07-29 23:31:53',NULL,NULL),(8,'Ashutosh Rana','ashutoshrana1999@gmail.com','65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5',0,'2024-07-30 02:33:40',NULL,NULL);
