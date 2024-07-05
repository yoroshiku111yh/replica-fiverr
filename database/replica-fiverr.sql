-- -------------------------------------------------------------
-- TablePlus 5.9.6(546)
--
-- https://tableplus.com/
--
-- Database: replica-fiverr
-- Generation Time: 2024-07-06 00:11:57.6640
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


CREATE TABLE `certification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `certification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gig-comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(255) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `gig-comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gig-comments_users` (
  `comment_id` int NOT NULL,
  `gig_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`gig_id`,`comment_id`,`user_id`),
  KEY `comment_id` (`comment_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `gig-comments_users_ibfk_2` FOREIGN KEY (`comment_id`) REFERENCES `gig-comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gig-comments_users_ibfk_3` FOREIGN KEY (`gig_id`) REFERENCES `gigs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gig-comments_users_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gig-rating_users` (
  `gig_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` float NOT NULL DEFAULT '3',
  PRIMARY KEY (`gig_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `gig-rating_users_ibfk_1` FOREIGN KEY (`gig_id`) REFERENCES `gigs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gig-rating_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gig_booking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gig_id` int DEFAULT NULL,
  `renter_id` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `status_id` int DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `gig_author_id` int NOT NULL,
  `endAt` datetime DEFAULT NULL,
  `name_booking` varchar(255) NOT NULL,
  `price` float NOT NULL,
  PRIMARY KEY (`id`),
  KEY `status_id` (`status_id`),
  KEY `renter_id` (`renter_id`),
  KEY `gig_id` (`gig_id`),
  KEY `gig_author_id` (`gig_author_id`),
  CONSTRAINT `gig_booking_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `gig_status` (`id`) ON DELETE SET DEFAULT,
  CONSTRAINT `gig_booking_ibfk_5` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gig_booking_ibfk_6` FOREIGN KEY (`gig_id`) REFERENCES `gigs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `gig_booking_ibfk_7` FOREIGN KEY (`gig_author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gig_booking_user` (
  `renter_id` int NOT NULL,
  `author_id` int NOT NULL,
  PRIMARY KEY (`renter_id`,`author_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `gig_booking_user_ibfk_3` FOREIGN KEY (`renter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gig_booking_user_ibfk_4` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gig_cate_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `gig_cate_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `gig_cate_id` (`gig_cate_id`),
  CONSTRAINT `gig_cate_details_ibfk_1` FOREIGN KEY (`gig_cate_id`) REFERENCES `gig_cates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gig_cates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_cate` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gig_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gigs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `author_id` int NOT NULL,
  `stars` float DEFAULT '0',
  `detail` varchar(255) NOT NULL,
  `price` int NOT NULL DEFAULT '0',
  `deleted` tinyint(1) DEFAULT '0',
  `rating_count` int DEFAULT '0',
  `rating_total` float DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `gigs_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gigs_gig_cate_details` (
  `gig_id` int NOT NULL,
  `gig_cate_detail_id` int NOT NULL,
  PRIMARY KEY (`gig_id`,`gig_cate_detail_id`),
  KEY `gig_cate_detail_id` (`gig_cate_detail_id`),
  CONSTRAINT `gigs_gig_cate_details_ibfk_2` FOREIGN KEY (`gig_cate_detail_id`) REFERENCES `gig_cate_details` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gigs_gig_cate_details_ibfk_3` FOREIGN KEY (`gig_id`) REFERENCES `gigs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gig_id` int NOT NULL,
  `user_id` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `content` varchar(255) NOT NULL,
  `review_starts` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `gig_id` (`gig_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`gig_id`) REFERENCES `gigs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `skill_user` (
  `skill_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`skill_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `skill_user_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `skill_user_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_skill` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `pass_word` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `birth_day` varchar(255) DEFAULT NULL,
  `role_id` int NOT NULL DEFAULT '0',
  `avatar` varchar(255) DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET DEFAULT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `certification` (`id`, `name`, `user_id`) VALUES
(2, 'certi2', 14),
(5, 'certi1', 15),
(6, 'certi2', 15),
(7, 'Certification index 1', 13),
(8, 'React master IBM', 13);

INSERT INTO `gig-comments` (`id`, `content`, `createdAt`, `deleted`, `user_id`) VALUES
(2, 'hello world', '2024-07-04 16:20:48', 0, 15),
(3, 'hello world', '2024-07-04 16:21:13', 0, 15),
(4, 'hello world 14', '2024-07-05 16:47:32', 1, 13);

INSERT INTO `gig-comments_users` (`comment_id`, `gig_id`, `user_id`) VALUES
(2, 12, 15),
(3, 12, 15),
(4, 14, 13);

INSERT INTO `gig_booking` (`id`, `gig_id`, `renter_id`, `createdAt`, `status_id`, `deleted`, `gig_author_id`, `endAt`, `name_booking`, `price`) VALUES
(10, 12, 13, '2024-07-05 16:10:38', 1, 1, 14, '2024-07-08 00:00:00', 'booking\'s name', 90),
(11, 12, 13, '2024-07-05 16:15:43', 5, 0, 14, '2024-07-07 00:00:00', 'booking\'s name', 90);

INSERT INTO `gig_booking_user` (`renter_id`, `author_id`) VALUES
(13, 14);

INSERT INTO `gig_cate_details` (`id`, `name`, `description`, `image`, `gig_cate_id`) VALUES
(2, 'Wireframing', 'Wireframing\'s description', '/img/sub-categories/1718375671668-HYS5-maxresdefault.jpg', 2),
(7, 'UI/UX', 'UI description', NULL, 2);

INSERT INTO `gig_cates` (`id`, `name_cate`) VALUES
(2, 'Web design'),
(4, 'Front-end');

INSERT INTO `gig_status` (`id`, `name`) VALUES
(1, 'canceled'),
(2, 'completed'),
(3, 'doing'),
(4, 'failed'),
(5, 'created'),
(6, 'pending');

INSERT INTO `gigs` (`id`, `name`, `image`, `description`, `author_id`, `stars`, `detail`, `price`, `deleted`, `rating_count`, `rating_total`) VALUES
(12, 'Gig name', NULL, 'Gig description', 14, 0, 'Gig detail', 1000, 0, 0, 0),
(14, 'Gig name update', '/img/gigs/1720194886044-DT2t-maxresdefault.jpg', 'Gig description', 13, 0, 'Gig detail', 100, 0, 0, 0);

INSERT INTO `gigs_gig_cate_details` (`gig_id`, `gig_cate_detail_id`) VALUES
(12, 2),
(14, 2);

INSERT INTO `roles` (`id`, `name_role`) VALUES
(1, 'ADMIN'),
(2, 'USER');

INSERT INTO `skill_user` (`skill_id`, `user_id`) VALUES
(8, 13),
(8, 14),
(8, 15),
(9, 13),
(9, 14),
(9, 15),
(14, 13),
(14, 15);

INSERT INTO `skills` (`id`, `name_skill`) VALUES
(3, 'Nodejs'),
(4, 'Photoshop'),
(5, 'Figma'),
(6, 'Content Writer'),
(7, 'Design'),
(8, 'Html'),
(9, 'CSS'),
(14, 'Reactjs');

INSERT INTO `users` (`id`, `fullname`, `email`, `gender`, `pass_word`, `phone`, `birth_day`, `role_id`, `avatar`, `refresh_token`, `deleted`) VALUES
(13, 'elizabeth kiki', 'user@example.com', 'Male', '$2b$10$tOAIgsG6EFoBXbEvXNuyIutx4KBQPIcTGrY/oD58fegWBw7xx9oe2', '01234567890', '09/09/1993', 1, '/img/avatar/1720185488846-vAr3-maxresdefault.jpg', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsIm5hbWUiOiJlbGl6YWJldGgga2lraSIsImtleVBhaXIiOiJsUmQiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjAxOTc1OTUsImV4cCI6MTcyMDgwMjM5NX0.AS_mBzc7vBHXVZ1uS_bd9iEJjG8BpCclTHvzO0udmHw', 0),
(14, 'elizabeth kiki', 'user911@example.com', 'Male', '$2b$10$ZtrRH1lHwPykySQ52OzoZOOtZnVs3kNqi/uc1QnhJnBXJEZbGWTU6', '01234567890', '09/09/1993', 2, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsIm5hbWUiOiJlbGl6YWJldGgga2lraSIsImtleVBhaXIiOiJqdkwiLCJpYXQiOjE3MTk4NDMxMjksImV4cCI6MTcyMDQ0NzkyOX0.HwHkRtyYj30RRtHvVLIvD3rk48BzYUl-er92Cq3wGWU', 0),
(15, 'elizabeth kiki', 'user123@example.com', 'Male', '$2b$10$q1P.wGoqK7s8B15utORzXOS1uQaIaTfvrr4vzGxHHmT4ABYV3Y/bG', '01234567890', '09/09/1993', 2, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsIm5hbWUiOiJlbGl6YWJldGgga2lraSIsImtleVBhaXIiOiJUN20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcyMDExMDAyOCwiZXhwIjoxNzIwNzE0ODI4fQ.ZL1JRoNAEcHLckYF0XrK__F0vZfN83fY-S0_2ev09qQ', 0);



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;