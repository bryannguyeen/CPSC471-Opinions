-- MySQL dump 10.13  Distrib 8.0.13, for Win64 (x86_64)
--
-- Host: localhost    Database: opinions
-- ------------------------------------------------------
-- Server version	8.0.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adminstrator`
--

DROP TABLE IF EXISTS `adminstrator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `adminstrator` (
  `AdmimUsername` varchar(25) NOT NULL,
  PRIMARY KEY (`AdmimUsername`),
  CONSTRAINT `adminstrator_ibfk_1` FOREIGN KEY (`AdmimUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminstrator`
--

LOCK TABLES `adminstrator` WRITE;
/*!40000 ALTER TABLE `adminstrator` DISABLE KEYS */;
/*!40000 ALTER TABLE `adminstrator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `comment` (
  `CommentID` int(11) NOT NULL AUTO_INCREMENT,
  `BodyText` varchar(2000) NOT NULL,
  `IsNSFW` tinyint(1) DEFAULT '0',
  `PostDate` date NOT NULL,
  `CreatorUsername` varchar(25) DEFAULT NULL,
  `AssociatedPost` int(11) NOT NULL,
  PRIMARY KEY (`CommentID`),
  KEY `CreatorUsername` (`CreatorUsername`),
  KEY `AssociatedPost` (`AssociatedPost`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commentvote`
--

DROP TABLE IF EXISTS `commentvote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `commentvote` (
  `AssociatedComment` int(11) NOT NULL,
  `VoterUsername` varchar(25) NOT NULL,
  PRIMARY KEY (`AssociatedComment`,`VoterUsername`),
  KEY `VoterUsername` (`VoterUsername`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commentvote`
--

LOCK TABLES `commentvote` WRITE;
/*!40000 ALTER TABLE `commentvote` DISABLE KEYS */;
/*!40000 ALTER TABLE `commentvote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `country`
--

DROP TABLE IF EXISTS `country`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `country` (
  `Name` varchar(25) NOT NULL,
  PRIMARY KEY (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `country`
--

LOCK TABLES `country` WRITE;
/*!40000 ALTER TABLE `country` DISABLE KEYS */;
/*!40000 ALTER TABLE `country` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `follows` (
  `Follower` varchar(25) NOT NULL,
  `Followee` varchar(25) NOT NULL,
  PRIMARY KEY (`Follower`,`Followee`),
  KEY `Followee` (`Followee`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`Follower`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`Followee`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group`
--

DROP TABLE IF EXISTS `group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `group` (
  `GroupName` varchar(25) NOT NULL,
  `Description` varchar(5000) NOT NULL,
  `CreatorUsername` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`GroupName`),
  KEY `CreatorUsername` (`CreatorUsername`),
  CONSTRAINT `group_ibfk_1` FOREIGN KEY (`CreatorUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group`
--

LOCK TABLES `group` WRITE;
/*!40000 ALTER TABLE `group` DISABLE KEYS */;
/*!40000 ALTER TABLE `group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mail`
--

DROP TABLE IF EXISTS `mail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `mail` (
  `MailID` int(11) NOT NULL AUTO_INCREMENT,
  `Subject` varchar(25) NOT NULL,
  `BodyText` varchar(5000) DEFAULT NULL,
  `Sender` varchar(25) DEFAULT NULL,
  `Reciever` varchar(25) NOT NULL,
  PRIMARY KEY (`MailID`),
  KEY `Sender` (`Sender`),
  KEY `Reciever` (`Reciever`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mail`
--

LOCK TABLES `mail` WRITE;
/*!40000 ALTER TABLE `mail` DISABLE KEYS */;
/*!40000 ALTER TABLE `mail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moderates`
--

DROP TABLE IF EXISTS `moderates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `moderates` (
  `ModUsername` varchar(25) NOT NULL,
  `GroupName` varchar(25) NOT NULL,
  PRIMARY KEY (`ModUsername`,`GroupName`),
  KEY `GroupName` (`GroupName`),
  CONSTRAINT `moderates_ibfk_1` FOREIGN KEY (`ModUsername`) REFERENCES `moderator` (`modusername`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `moderates_ibfk_2` FOREIGN KEY (`GroupName`) REFERENCES `group` (`groupname`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderates`
--

LOCK TABLES `moderates` WRITE;
/*!40000 ALTER TABLE `moderates` DISABLE KEYS */;
/*!40000 ALTER TABLE `moderates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moderator`
--

DROP TABLE IF EXISTS `moderator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `moderator` (
  `ModUsername` varchar(25) NOT NULL,
  PRIMARY KEY (`ModUsername`),
  CONSTRAINT `moderator_ibfk_1` FOREIGN KEY (`ModUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderator`
--

LOCK TABLES `moderator` WRITE;
/*!40000 ALTER TABLE `moderator` DISABLE KEYS */;
/*!40000 ALTER TABLE `moderator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `post` (
  `PostID` int(11) NOT NULL AUTO_INCREMENT,
  `CreatorUsername` varchar(25) DEFAULT NULL,
  `AssociatedGroup` varchar(25) NOT NULL,
  `Score` int(11) DEFAULT '0',
  `LikeCount` int(11) NOT NULL,
  `Title` varchar(25) NOT NULL,
  `Bodytext` varchar(5000) NOT NULL,
  `PostDate` date NOT NULL,
  `IsNFSW` tinyint(1) DEFAULT '0',
  `CountryOfOrigin` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`PostID`),
  KEY `CreatorUsername` (`CreatorUsername`),
  KEY `AssociatedGroup` (`AssociatedGroup`),
  KEY `CountryOfOrigin` (`CountryOfOrigin`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postvote`
--

DROP TABLE IF EXISTS `postvote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `postvote` (
  `AssociatedPost` int(11) NOT NULL,
  `VoterUsername` varchar(25) NOT NULL,
  PRIMARY KEY (`AssociatedPost`,`VoterUsername`),
  KEY `VoterUsername` (`VoterUsername`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postvote`
--

LOCK TABLES `postvote` WRITE;
/*!40000 ALTER TABLE `postvote` DISABLE KEYS */;
/*!40000 ALTER TABLE `postvote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscribedto`
--

DROP TABLE IF EXISTS `subscribedto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `subscribedto` (
  `SubscriberUsername` varchar(25) NOT NULL,
  `GroupName` varchar(25) NOT NULL,
  PRIMARY KEY (`SubscriberUsername`,`GroupName`),
  KEY `GroupName` (`GroupName`),
  CONSTRAINT `subscribedto_ibfk_1` FOREIGN KEY (`SubscriberUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subscribedto_ibfk_2` FOREIGN KEY (`GroupName`) REFERENCES `group` (`groupname`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscribedto`
--

LOCK TABLES `subscribedto` WRITE;
/*!40000 ALTER TABLE `subscribedto` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscribedto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user` (
  `Username` varchar(25) NOT NULL,
  `Password` varchar(25) NOT NULL,
  PRIMARY KEY (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usersettings`
--

DROP TABLE IF EXISTS `usersettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `usersettings` (
  `Username` varchar(25) NOT NULL,
  `HideNSFW` tinyint(1) NOT NULL,
  PRIMARY KEY (`Username`),
  CONSTRAINT `usersettings_ibfk_1` FOREIGN KEY (`Username`) REFERENCES `user` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usersettings`
--

LOCK TABLES `usersettings` WRITE;
/*!40000 ALTER TABLE `usersettings` DISABLE KEYS */;
/*!40000 ALTER TABLE `usersettings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-30 19:38:24
