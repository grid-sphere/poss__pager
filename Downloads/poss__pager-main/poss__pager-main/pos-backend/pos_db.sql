-- MySQL dump 10.13  Distrib 9.5.0, for macos26.2 (arm64)
--
-- Host: localhost    Database: pos_db
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2532e646-f066-11f0-a929-261f2970b84a:1-94';

--
-- Table structure for table `app_settings`
--

DROP TABLE IF EXISTS `app_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_settings` (
  `id` int NOT NULL DEFAULT '1',
  `upi_id` varchar(255) DEFAULT NULL,
  `payee_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_settings`
--

LOCK TABLES `app_settings` WRITE;
/*!40000 ALTER TABLE `app_settings` DISABLE KEYS */;
INSERT INTO `app_settings` VALUES (1,'aakash@okaxis','aakash');
/*!40000 ALTER TABLE `app_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,5,'Paneer Tikka',180.00,2,360.00),(2,1,8,'Lassi',80.00,1,80.00),(3,2,5,'Paneer Tikka',180.00,2,360.00),(4,2,8,'Lassi',80.00,1,80.00),(5,3,5,'Paneer Tikka',180.00,2,360.00),(6,3,8,'Lassi',80.00,1,80.00),(7,4,5,'Paneer Tikka',180.00,2,360.00),(8,4,8,'Lassi',80.00,1,80.00),(9,10,6,'Spring Rolls',120.00,1,120.00),(10,11,5,'Paneer Tikka',180.00,1,180.00),(11,11,20,'momo',40.00,1,40.00),(12,11,6,'Spring Rolls',120.00,1,120.00),(13,11,9,'French Fries',80.00,1,80.00),(14,11,10,'Chicken Wings',220.00,1,220.00),(15,11,7,'Butter Chicken',280.00,1,280.00),(16,11,14,'Roti',20.00,1,20.00),(17,11,15,'Chicken Biryani',260.00,1,260.00),(18,11,11,'Dal Makhani',180.00,1,180.00),(19,11,12,'Paneer Butter Masala',240.00,1,240.00),(20,11,13,'Naan',40.00,1,40.00),(21,11,8,'Lassi',80.00,1,80.00),(22,11,16,'Cold Coffee',120.00,1,120.00),(23,11,17,'Lemon Soda',60.00,1,60.00),(24,11,18,'Masala Chai',30.00,1,30.00),(25,11,19,'momo',40.00,1,40.00),(26,12,10,'Chicken Wings',220.00,1,220.00),(27,12,9,'French Fries',80.00,1,80.00),(28,13,9,'French Fries',80.00,1,80.00),(29,13,6,'Spring Rolls',120.00,1,120.00),(30,14,9,'French Fries',80.00,2,160.00),(31,14,6,'Spring Rolls',120.00,1,120.00),(32,14,10,'Chicken Wings',220.00,1,220.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('upi','cash','card') NOT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `status` enum('created','active','ready','completed') DEFAULT 'created',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,440.00,'upi','pending','created','2026-01-23 08:45:08',NULL),(2,440.00,'upi','pending','created','2026-01-23 11:48:17',NULL),(3,440.00,'upi','pending','created','2026-01-23 11:53:47',NULL),(4,440.00,'upi','pending','created','2026-01-23 11:57:59',NULL),(5,300.00,'cash','pending','created','2026-01-26 04:08:04',NULL),(6,220.00,'cash','pending','created','2026-01-26 04:50:42',NULL),(7,120.00,'cash','pending','created','2026-01-26 05:01:05',NULL),(8,120.00,'cash','pending','created','2026-01-26 05:01:59',NULL),(9,120.00,'cash','pending','created','2026-01-26 05:08:35',NULL),(10,120.00,'cash','pending','created','2026-01-26 05:10:33',NULL),(11,1990.00,'cash','pending','created','2026-01-26 05:14:13',NULL),(12,300.00,'upi','pending','created','2026-01-26 17:56:20',NULL),(13,210.00,'upi','pending','created','2026-01-27 18:08:19','1'),(14,525.00,'upi','pending','created','2026-01-27 18:09:06','1');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `category` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (5,'Paneer Tikka',180.00,50,'Starters'),(6,'Spring Rolls',120.00,40,'Starters'),(7,'Butter Chicken',280.00,30,'Main Course'),(8,'Lassi',80.00,100,'Beverages'),(9,'French Fries',80.00,60,'Starters'),(10,'Chicken Wings',220.00,25,'Starters'),(11,'Dal Makhani',180.00,40,'Main Course'),(12,'Paneer Butter Masala',240.00,35,'Main Course'),(13,'Naan',40.00,200,'Main Course'),(14,'Roti',20.00,300,'Main Course'),(15,'Chicken Biryani',260.00,20,'Main Course'),(16,'Cold Coffee',120.00,50,'Beverages'),(17,'Lemon Soda',60.00,80,'Beverages'),(18,'Masala Chai',30.00,150,'Beverages'),(20,'momo',40.00,100,'Starters');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_settings`
--

DROP TABLE IF EXISTS `store_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_settings` (
  `id` int NOT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `payee_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_settings`
--

LOCK TABLES `store_settings` WRITE;
/*!40000 ALTER TABLE `store_settings` DISABLE KEYS */;
INSERT INTO `store_settings` VALUES (1,'test@upi','Test Store');
/*!40000 ALTER TABLE `store_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','manager','cashier') DEFAULT 'cashier',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('aakash','aakash@gmail.com','$2b$10$cOXN9yq583InI1pvgy.z2enUZ8sNOCISl25LNwRAynVUurwtydOem','admin','2026-01-25 17:23:49'),('aakash','aakash123@gmail.com','$2b$10$JYzM7.YbYzTsJLbgJ2sULet/lPYo3m/yKgWDKYPDcA6m2xo9mHfka','cashier','2026-01-20 12:35:56'),('abcd','abcd123@gmail.com','$2b$10$UrDZqKA6P0Ev5kSsX8e.S.xDLnvsbiOOpZB.hwoL8cI5USG2jhFhy','admin','2026-01-21 10:26:43'),('aditya','adit123@gmail.com','$2b$10$hkxVXSUzEnhVA0JjQZngre2QazTcQE1bykE81UhyZV423ZMGm2SQ.','admin','2026-01-21 09:07:29'),('aditya','aditi123@gmail.com','$2b$10$rnAIgY0IugnC3TYIheUVRuZa0rmi2wjtU0.B.xpPn5qsVtDcNbXTO','admin','2026-01-21 09:07:49'),('aditya','aditya123@gmail.com','$2b$10$5cJ5n7DTft1Q5E9EED.lk.65P7xPEknELYHcCwqVOVenstmU6wL82','admin','2026-01-21 09:07:08'),('admin456','admin456@gmail.com','$2b$10$QRpN2s8WeafMKO0c4p85XeZYQ3O8KrRxajeF5GZ85GkXBXmOJblHC','admin','2026-01-26 07:15:37'),('benny','benny@gmail.com','$2b$10$4DnBiaVnzRUVzJXHSCN7De8qXyaN5PLIxBkNdpW/P2oPTN7K2EwPa','cashier','2026-01-27 17:58:50'),('fgh','fgh567@gmail.com','$2b$10$G7m1QfVjxIVvjS6c.ieVR.JhWDimG3uqhq/qgYaxmLqMMp1XsxaHW','admin','2026-01-22 09:49:15'),('riya','hslr@gmail.com','$2b$10$7HzxfobAa4aTg.CJ4Okin.9q8ywFGTjAp7cuoXz1UStj1ymeR3YAq','cashier','2026-01-26 08:12:32'),('john ','joh321@gmail.com','$2b$10$EKbHPTMFKgaIRLtSoCdxxe2raLBeqq0/oszayhlwu1DsZUKcFk5wW','manager','2026-01-26 07:09:32'),('john','john321@gmail.com','$2b$10$W6oPbURs0lR/fGx/jTPlQ.25qSjZFIvV/dsNjzEKqxbHCv9I1yNh.','admin','2026-01-26 05:16:13'),('Test Manager','manager@test.com','$2b$10$j1Meqqs4l5Wm2J/Ackcpfu3d3bnqqsiYx/218TSOTdzB2wAN0Suom','manager','2026-01-26 07:08:47'),('mridul','mridul@test.com','$2b$10$hlUKaz.91WLKEYobkL8AvOXro6fh2AdzDwYqa43udleDO5o6CvpHi','admin','2026-01-19 10:51:28'),('mridul','mridulbhardwaj13@gmail.com','$2b$10$mSnQyhjePCXEVLqz4wTEjuvNmd1Pz01dzVjl5T5jFtZqhzrPURqaK','cashier','2026-01-27 09:16:07'),('mridul bhardwaj','mridulbhardwaj13@gmal.com','$2b$10$2fATMUa4H5/BI4SLxwUz7.sHbj.zZI0eL3mSfGf42EvX/OTAmalle','cashier','2026-01-19 11:58:29'),('raj','raj123@gmail.com','$2b$10$DilM2DI0utYp9zKpor.o0uTR5b27B1obcxzX68NRnL6b4xhPPLSqW','cashier','2026-01-26 03:56:49'),('riya','riya123@gmail.com','$2b$10$eCNwJpVGIyekcwis853x7e63sStvFdK30PBBAAfiZ/v2Uv0xtYLZO','admin','2026-01-22 10:14:37'),('saksham','saksh123@gmail.com','$2b$10$pj8NDVbu.TDLXXWTutf20.y3OkOPWyB/OCrNycy23eNNB34ByT3nu','admin','2026-01-21 10:25:54'),('saksham','sakshamchawla@gmail.com','$2b$10$bx86u0db8eZPSWhnPmX7n.VhuiEdsM31xth0rOCAS4qrd7uXx.lpa','cashier','2026-01-21 09:44:56'),('xyz','xyz321@gmail.com','$2b$10$0RLd2wsM0UYIqvcSxidx5uTAV8dgXPoU3p4W7l6E91V/9KGmE/SFu','cashier','2026-01-22 08:37:17'),('yash','yash69@gmail.com','$2b$10$FJdPk1hJxbLrPyW7CdlvIOcwes89Pbq6QkFmLRqTb6Z8blk7A.16m','cashier','2026-01-26 17:56:02');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-28  8:29:44
