DROP TABLE IF EXISTS `postvote`;
CREATE TABLE `postvote` (
  `AssociatedPost` int(11) NOT NULL,
  `VoterUsername` varchar(25) NOT NULL,
  `Type` tinyint(1) NOT NULL,
  PRIMARY KEY (`AssociatedPost`,`VoterUsername`),
  CONSTRAINT `postvote_ibfk_1` FOREIGN KEY (`VoterUsername`) REFERENCES `user` (`username`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `postvote_ibfk_2` FOREIGN KEY (`AssociatedPost`) REFERENCES `post` (`postid`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Down
