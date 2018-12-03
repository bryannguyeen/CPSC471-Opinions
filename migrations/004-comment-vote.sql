-- Adds Type
DROP TABLE IF EXISTS `commentvote`;
CREATE TABLE `commentvote` (
  `AssociatedComment` int(11) NOT NULL,
  `VoterUsername` varchar(25) NOT NULL,
  `Type` tinyint(1) NOT NULL,
  PRIMARY KEY (`AssociatedComment`,`VoterUsername`),
  CONSTRAINT `commentvote_ibfk_1` FOREIGN KEY (`AssociatedComment`) REFERENCES `comment` (`commentid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `commentvote_ibfk_2` FOREIGN KEY (`VoterUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
);


-- Adds LikeCount
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `CommentID` INTEGER,
  `BodyText` varchar(2000) NOT NULL,
  `LikeCount` int(11) NOT NULL,
  `IsNSFW` tinyint(1) DEFAULT '0',
  `PostDate` date DEFAULT (datetime('now','localtime')),
  `CreatorUsername` varchar(25) DEFAULT NULL,
  `AssociatedPost` int(11) NOT NULL,
  PRIMARY KEY (`CommentID`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`CreatorUsername`) REFERENCES `user` (`username`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`AssociatedPost`) REFERENCES `post` (`postid`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Down

