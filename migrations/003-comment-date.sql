DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `CommentID` INTEGER,
  `BodyText` varchar(2000) NOT NULL,
  `IsNSFW` tinyint(1) DEFAULT '0',
  `PostDate` date DEFAULT (datetime('now','localtime')),
  `CreatorUsername` varchar(25) DEFAULT NULL,
  `AssociatedPost` int(11) NOT NULL,
  PRIMARY KEY (`CommentID`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`CreatorUsername`) REFERENCES `user` (`username`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`AssociatedPost`) REFERENCES `post` (`postid`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Down

