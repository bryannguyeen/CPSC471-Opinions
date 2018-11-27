-- MySQL dump 10.13  Distrib 8.0.13, for Win64 (x86_64)
--
-- Host: localhost    Database: opinions
-- ------------------------------------------------------
-- Server version	8.0.13
--
-- Table structure for table `adminstrator`
--

DROP TABLE IF EXISTS `adminstrator`;
CREATE TABLE `adminstrator` (
  `AdmimUsername` varchar(25) NOT NULL,
  PRIMARY KEY (`AdmimUsername`),
  CONSTRAINT `adminstrator_ibfk_1` FOREIGN KEY (`AdmimUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `CommentID` int(11) NOT NULL,
  `BodyText` varchar(2000) NOT NULL,
  `IsNSFW` tinyint(1) DEFAULT '0',
  `PostDate` date NOT NULL,
  `CreatorUsername` varchar(25) DEFAULT NULL,
  `AssociatedPost` int(11) NOT NULL,
  PRIMARY KEY (`CommentID`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`CreatorUsername`) REFERENCES `user` (`username`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`AssociatedPost`) REFERENCES `post` (`postid`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `commentvote`
--

DROP TABLE IF EXISTS `commentvote`;
CREATE TABLE `commentvote` (
  `AssociatedComment` int(11) NOT NULL,
  `VoterUsername` varchar(25) NOT NULL,
  PRIMARY KEY (`AssociatedComment`,`VoterUsername`),
  CONSTRAINT `commentvote_ibfk_1` FOREIGN KEY (`AssociatedComment`) REFERENCES `comment` (`commentid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `commentvote_ibfk_2` FOREIGN KEY (`VoterUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `country`
--

DROP TABLE IF EXISTS `country`;
CREATE TABLE `country` (
  `Name` varchar(25) NOT NULL,
  PRIMARY KEY (`Name`)
);

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
CREATE TABLE `follows` (
  `Follower` varchar(25) NOT NULL,
  `Followee` varchar(25) NOT NULL,
  PRIMARY KEY (`Follower`,`Followee`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`Follower`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`Followee`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `group`
--

DROP TABLE IF EXISTS `group`;
CREATE TABLE `group` (
  `GroupName` varchar(25) NOT NULL,
  `Description` varchar(5000) NOT NULL,
  `CreatorUsername` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`GroupName`),
  CONSTRAINT `group_ibfk_1` FOREIGN KEY (`CreatorUsername`) REFERENCES `user` (`username`) ON DELETE SET NULL ON UPDATE CASCADE
);

--
-- Table structure for table `mail`
--

DROP TABLE IF EXISTS `mail`;
CREATE TABLE `mail` (
  `MailID` int(11) NOT NULL,
  `Subject` varchar(25) NOT NULL,
  `BodyText` varchar(5000) DEFAULT NULL,
  `Sender` varchar(25) DEFAULT NULL,
  `Receiver` varchar(25) NOT NULL,
  PRIMARY KEY (`MailID`),
  CONSTRAINT `mail_ibfk_1` FOREIGN KEY (`Sender`) REFERENCES `user` (`username`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mail_ibfk_2` FOREIGN KEY (`Receiver`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `moderates`
--

DROP TABLE IF EXISTS `moderates`;
CREATE TABLE `moderates` (
  `ModUsername` varchar(25) NOT NULL,
  `GroupName` varchar(25) NOT NULL,
  PRIMARY KEY (`ModUsername`,`GroupName`),
  CONSTRAINT `moderates_ibfk_1` FOREIGN KEY (`ModUsername`) REFERENCES `moderator` (`modusername`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `moderates_ibfk_2` FOREIGN KEY (`GroupName`) REFERENCES `group` (`groupname`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `moderator`
--

DROP TABLE IF EXISTS `moderator`;
CREATE TABLE `moderator` (
  `ModUsername` varchar(25) NOT NULL,
  PRIMARY KEY (`ModUsername`),
  CONSTRAINT `moderator_ibfk_1` FOREIGN KEY (`ModUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `PostID` int(11) NOT NULL,
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
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`CreatorUsername`) REFERENCES `user` (`username`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`AssociatedGroup`) REFERENCES `group` (`groupname`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_ibfk_3` FOREIGN KEY (`CountryOfOrigin`) REFERENCES `country` (`name`) ON UPDATE CASCADE
);

--
-- Table structure for table `postvote`
--

DROP TABLE IF EXISTS `postvote`;
CREATE TABLE `postvote` (
  `AssociatedPost` int(11) NOT NULL,
  `VoterUsername` varchar(25) NOT NULL,
  PRIMARY KEY (`AssociatedPost`,`VoterUsername`),
  CONSTRAINT `postvote_ibfk_1` FOREIGN KEY (`VoterUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `postvote_ibfk_2` FOREIGN KEY (`AssociatedPost`) REFERENCES `post` (`postid`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `subscribedto`
--

DROP TABLE IF EXISTS `subscribedto`;
CREATE TABLE `subscribedto` (
  `SubscriberUsername` varchar(25) NOT NULL,
  `GroupName` varchar(25) NOT NULL,
  PRIMARY KEY (`SubscriberUsername`,`GroupName`),
  CONSTRAINT `subscribedto_ibfk_1` FOREIGN KEY (`SubscriberUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subscribedto_ibfk_2` FOREIGN KEY (`GroupName`) REFERENCES `group` (`groupname`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `Username` varchar(25) NOT NULL,
  `Password` varchar(25) NOT NULL,
  PRIMARY KEY (`Username`)
);

--
-- Table structure for table `usersettings`
--

DROP TABLE IF EXISTS `usersettings`;
CREATE TABLE `usersettings` (
  `Username` varchar(25) NOT NULL,
  `HideNSFW` tinyint(1) NOT NULL,
  PRIMARY KEY (`Username`),
  CONSTRAINT `usersettings_ibfk_1` FOREIGN KEY (`Username`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Dump completed on 2018-10-30 19:38:24

-- Down

-- Nothing
