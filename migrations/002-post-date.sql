DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `PostID` INTEGER,
  `CreatorUsername` varchar(25) DEFAULT NULL,
  `AssociatedGroup` varchar(25) NOT NULL,
  `Score` int(11) DEFAULT '0',
  `LikeCount` int(11) NOT NULL,
  `Title` varchar(25) NOT NULL,
  `Bodytext` varchar(5000) NOT NULL,
  `PostDate` date DEFAULT (datetime('now','localtime')),
  `IsNFSW` tinyint(1) DEFAULT '0',
  `CountryOfOrigin` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`PostID`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`CreatorUsername`) REFERENCES `user` (`username`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`AssociatedGroup`) REFERENCES `group` (`groupname`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_ibfk_3` FOREIGN KEY (`CountryOfOrigin`) REFERENCES `country` (`name`) ON UPDATE CASCADE
);

-- Down

