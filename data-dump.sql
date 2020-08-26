-- MariaDB dump 10.17  Distrib 10.4.13-MariaDB, for osx10.15 (x86_64)
--
-- Host: localhost    Database: resource-manager
-- ------------------------------------------------------
-- Server version	10.4.13-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `resource_attachments`
--

DROP TABLE IF EXISTS `resource_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resource_attachments` (
  `id` varchar(16) NOT NULL,
  `res_id` varchar(16) NOT NULL,
  `url` text NOT NULL,
  `description` text DEFAULT NULL,
  `iscover` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `res_id` (`res_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_attachments`
--

LOCK TABLES `resource_attachments` WRITE;
/*!40000 ALTER TABLE `resource_attachments` DISABLE KEYS */;
INSERT INTO `resource_attachments` VALUES ('A-1245-4563-1234','R-1234-5678-9012','https://i.imgur.com/Hgipyww.jpg','i like trains',1),('A-6223-2883-0154','I-4576-4564-2343','https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fvignette1.wikia.nocookie.net%2Fblogclan-2%2Fimages%2F4%2F45%2FRandom-turtle.gif%2Frevision%2Flatest%3Fcb%3D20160706220110&f=1&nofb=1','hehe gif',1);
/*!40000 ALTER TABLE `resource_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_instances`
--

DROP TABLE IF EXISTS `resource_instances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resource_instances` (
  `id` varchar(16) NOT NULL,
  `resource` varchar(16) NOT NULL,
  `description` text DEFAULT NULL,
  `loan` varchar(16) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `resource` (`resource`),
  CONSTRAINT `resource_instances_ibfk_1` FOREIGN KEY (`resource`) REFERENCES `resources` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_instances`
--

LOCK TABLES `resource_instances` WRITE;
/*!40000 ALTER TABLE `resource_instances` DISABLE KEYS */;
INSERT INTO `resource_instances` VALUES ('I-4576-4564-2343','R-1234-5678-9012','',NULL,NULL),('I-5467-2346-3453','R-1234-5678-9012','it would be incredible if this actually worked first time',NULL,NULL);
/*!40000 ALTER TABLE `resource_instances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resource_tags`
--

DROP TABLE IF EXISTS `resource_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resource_tags` (
  `res_id` varchar(16) NOT NULL,
  `tag_id` varchar(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resource_tags`
--

LOCK TABLES `resource_tags` WRITE;
/*!40000 ALTER TABLE `resource_tags` DISABLE KEYS */;
INSERT INTO `resource_tags` VALUES ('R-1234-5678-9012','blah'),('R-1234-5678-9012','camera');
/*!40000 ALTER TABLE `resource_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resources` (
  `id` varchar(16) NOT NULL,
  `name` varchar(255) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `description` text DEFAULT NULL,
  `loan` varchar(16) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES ('R-1234-5678-9012','canon 200d','canon-200d',1,'matthew\'s favorite camera',NULL,NULL);
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` varchar(16) NOT NULL,
  `username` varchar(255) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `password` text NOT NULL,
  `permissions` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('U-0464-0688-6557','Bob the Builder','bob-the-builder','$2b$10$tirzueJeryYXa1wyBlZpIODyQAin9Zhdfc1BUe0IwT8lGs5p.IuCO',2),('U-1234-5678-9012','test','test','$2b$10$ii6fQ0rHfNwEmA/7cKkQ/.ot1GVKRiVfc54l2aYItJ4rSYrjoDfJu',0),('U-4057-6425-3434','awdauwbd','awdauwbd','$2b$10$AGhK3frWDbrIaDumHBBQIudjh9bz.JT9sB8StUHqtIqqlrE6tFXfW',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-08-26 22:24:39
