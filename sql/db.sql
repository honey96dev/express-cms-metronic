/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 10.1.37-MariaDB : Database - express_cms
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`express_cms` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `express_cms`;

/*Table structure for table `admins` */

DROP TABLE IF EXISTS `admins`;

CREATE TABLE `admins` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(200) NOT NULL DEFAULT '',
  `password` varchar(400) NOT NULL DEFAULT '',
  `name` varchar(200) NOT NULL DEFAULT '',
  `note` varchar(200) DEFAULT '',
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `allow` tinyint(1) NOT NULL DEFAULT '0',
  `verifyTimestamp` varchar(60) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/*Data for the table `admins` */

insert  into `admins`(`id`,`email`,`password`,`name`,`note`,`emailVerified`,`allow`,`verifyTimestamp`) values 
(1,'admin@gmail.com','bf7f4114f486f77233d9f77201f940dc956e916b87e217ffa19d328c0625e791','admin','',0,0,'');

/*Table structure for table `amenities` */

DROP TABLE IF EXISTS `amenities`;

CREATE TABLE `amenities` (
  `property_id` int(11) NOT NULL,
  `washer` tinyint(1) DEFAULT '0',
  `gym` tinyint(1) DEFAULT '0',
  `parkingSpot` tinyint(1) DEFAULT '0',
  `airConditioning` tinyint(1) DEFAULT '0',
  `dishwasher` tinyint(1) DEFAULT '0',
  `storage` tinyint(1) DEFAULT '0',
  `hardwoodFloors` tinyint(1) DEFAULT '0',
  `balcony` tinyint(1) DEFAULT '0',
  `view` tinyint(1) DEFAULT '0',
  `studentFriendly` tinyint(1) DEFAULT '0',
  `pool` tinyint(1) DEFAULT '0',
  `elevator` tinyint(1) DEFAULT '0',
  `fireplace` tinyint(1) DEFAULT '0',
  `doorman` tinyint(1) DEFAULT '0',
  `deck` tinyint(1) DEFAULT '0',
  `wheelchairAccessible` tinyint(1) DEFAULT '0',
  `garden` tinyint(1) DEFAULT '0',
  `furnished` tinyint(1) DEFAULT '0',
  `highRise` tinyint(1) DEFAULT '0',
  `utilitiesIncluded` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `amenities` */

insert  into `amenities`(`property_id`,`washer`,`gym`,`parkingSpot`,`airConditioning`,`dishwasher`,`storage`,`hardwoodFloors`,`balcony`,`view`,`studentFriendly`,`pool`,`elevator`,`fireplace`,`doorman`,`deck`,`wheelchairAccessible`,`garden`,`furnished`,`highRise`,`utilitiesIncluded`) values 
(1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0),
(2,0,1,1,0,0,0,0,0,0,1,0,0,1,0,0,1,1,0,1,0),
(3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),
(5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);

/*Table structure for table `documentos` */

DROP TABLE IF EXISTS `documentos`;

CREATE TABLE `documentos` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(60) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `url` varchar(512) DEFAULT NULL,
  `note` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

/*Data for the table `documentos` */

insert  into `documentos`(`id`,`name`,`description`,`url`,`note`) values 
(5,'This is a student. So he has to go school in time','this is test.','1213',NULL);

/*Table structure for table `properties` */

DROP TABLE IF EXISTS `properties`;

CREATE TABLE `properties` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(100) DEFAULT '',
  `address` varchar(200) DEFAULT '',
  `type` varchar(100) DEFAULT '',
  `rooms` int(3) DEFAULT '0',
  `baths` int(2) DEFAULT '0',
  `surface` double DEFAULT '0',
  `price` double DEFAULT '0',
  `accPrice` double DEFAULT '0',
  `monthlyPrice` double DEFAULT '0',
  `securityDeposit` double DEFAULT '0',
  `description` varchar(10000) DEFAULT '',
  `availableForm` varchar(100) DEFAULT '',
  `freeListingTrovit` tinyint(1) DEFAULT '0',
  `verified` int(11) NOT NULL DEFAULT '0',
  `creationDate` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='Properties table';

/*Data for the table `properties` */

insert  into `properties`(`id`,`userId`,`name`,`address`,`type`,`rooms`,`baths`,`surface`,`price`,`accPrice`,`monthlyPrice`,`securityDeposit`,`description`,`availableForm`,`freeListingTrovit`,`verified`,`creationDate`) values 
(1,2,'Berlin Appartment','Sankt Petersburg, Russia','Piso',4,1,10,5.3,100,12,333,'asdfgafdgasgfasfasfasdfsdfsdfasfsadfasdfasfsdfsfsdfsdfsdfsdfdsfdsfsdfsdfsdfdsfsdfsdfsdfdsfsdfsdfsdfdsfsdfsdfsdfsdfsdfsdfsdfsasdgasdfasaaaaag','10/07/2019',1,0,NULL),
(2,3,'test','Hunchun, Yanbian, Jilin, China','Piso',10,1,10,5.3,90,12,2,'asdfadsf\r\nasdfasdf\r\nasdf','07/18/2019',0,0,NULL),
(3,1,'Madrid Appartment','madrid','Casa',1,2,12,12,32,123,33,'123sdfasdfasfasfasfd123sdfasdfasfasfasfd123sdfasdfasfasfasfd123sdfasdfasfasfasfd123sdfasdfasfasfasfd123sdfasdfasfasfasfd123sdfasdfasfasfasfd123sdfasdfasfasfasfd','19/07/2019',0,0,NULL);

/*Table structure for table `property_photos` */

DROP TABLE IF EXISTS `property_photos`;

CREATE TABLE `property_photos` (
  `property_id` int(11) NOT NULL,
  `fileNames` varchar(4100) NOT NULL DEFAULT '',
  PRIMARY KEY (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `property_photos` */

insert  into `property_photos`(`property_id`,`fileNames`) values 
(1,'*fb2f6884-0f19-478c-856a-b033e9c7bf15.jpg*be371583-517b-43e3-93bb-8959ff5fa51f.png***'),
(2,'83e19f0f-0a5a-48f9-9f3a-bf392a59b5e4.jpg*29cbec5e-aa69-410e-8e98-3d28c34e4a9e.jpg*68b28648-b3be-47bb-863b-c3782826e58e.jpg*6ec56479-73fd-4a57-a916-01f71deeb801.jpg*99e65032-2484-4217-9f68-03f2f747fbeb.jpg*'),
(3,'**');

/*Table structure for table `sessions` */

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `sessions` */

insert  into `sessions`(`session_id`,`expires`,`data`) values 
('9BeeD14CnlLpo6zdLCJ73BjCchk4LuKU',1560401134,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),
('A89WHjaOE6VA4h35CqmR8l1LCkzqs2VU',1560401111,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),
('ezBio1rvZEWIxBzt4j7y9pfxs44fD7lu',1560401134,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"}}'),
('ndNzrgi1Wf6t4cySolbLbZVKpPx5Bg4T',1560401128,'{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"admin\":{\"id\":1,\"email\":\"admin@gmail.com\",\"name\":\"admin\"}}');

/*Table structure for table `tokens` */

DROP TABLE IF EXISTS `tokens`;

CREATE TABLE `tokens` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `token` varchar(100) NOT NULL DEFAULT '',
  `expire` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;

/*Data for the table `tokens` */

insert  into `tokens`(`id`,`token`,`expire`,`email`) values 
(2,'1584b43b3e0878eb5c512ef4bfba957d27549793369af98bf6d3334528671ecb','1558546038884','newtest@gmail.com'),
(3,'2cee1c7537ee1407011250c3e30c5d8bca601afa64c8175d30573ad648eea025','1558740304491','undefined'),
(7,'21c91d14be523868c5c71298603add6609e628eee7769bf6915d47345d3a3ad9','1558741101450','test@gmail.com'),
(8,'b3afde23fd6d923a50d9fa09500d29bfee386d3c7dd4d6ac289da9fde0eb45de','1559663240740','honey96dev@gmail.com'),
(9,'70b29549377411899c7128aa840abcf70cdfe998a470c632097836cb67d75adf','1559663916037','honey96dv@gmail.com'),
(10,'8f887474560cf18fb06d5d6e2d5f930c1f03e1a9b782ecf9d9c2cfa9f975072e','1559664159603','honey96div@gmail.com'),
(11,'c4324a8a1ad2dd28fc58a7b3c0354eaf6606c6910804e6f2d722657e755f24a1','1559769631775','admin@gmail.com'),
(12,'276ad63c9674f7874021712b58973273b51931f0d4a004e31e6cba46913bdbf1','1559760933693','admin@gmail.com'),
(13,'4782500ca98b212f2b7093b65e7615701749136e9d0db0f39d87169b1142888d','1559761010091','admin@gmail.com'),
(14,'51b200a196e3d9f8a4c3c7d0c4c636e9f40edcb94d88e3e4738971938b1b8926','1559761098119','admin@gmail.com'),
(15,'cd9556b78722c4ca9352582a2f8b6cc967038c771ee5e3e228fc87e757a2f584','1559889173761','today@gmail.com');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(200) NOT NULL DEFAULT '',
  `password` varchar(400) NOT NULL DEFAULT '',
  `name` varchar(200) NOT NULL DEFAULT '',
  `telephone` varchar(60) NOT NULL DEFAULT '',
  `createdDate` varchar(40) NOT NULL DEFAULT '0000-00-00',
  `note` varchar(200) DEFAULT '',
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `allow` tinyint(1) NOT NULL DEFAULT '0',
  `verifyTimestamp` varchar(60) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

/*Data for the table `users` */

insert  into `users`(`id`,`email`,`password`,`name`,`telephone`,`createdDate`,`note`,`emailVerified`,`allow`,`verifyTimestamp`) values 
(1,'test@gmail.com','bf7f4114f486f77233d9f77201f940dc956e916b87e217ffa19d328c0625e791','test','','0000-00-00','',1,0,''),
(2,'honey96dev@gmail.com','bf7f4114f486f77233d9f77201f940dc956e916b87e217ffa19d328c0625e791','test','','0000-00-00','',0,0,''),
(3,'honey96dv@gmail.com','bf7f4114f486f77233d9f77201f940dc956e916b87e217ffa19d328c0625e791','Honey','124123','0000-00-00','',1,0,''),
(4,'honey96div@gmail.com','bf7f4114f486f77233d9f77201f940dc956e916b87e217ffa19d328c0625e791','test','asdf','0000-00-00','',1,0,''),
(5,'today@gmail.com','bf7f4114f486f77233d9f77201f940dc956e916b87e217ffa19d328c0625e791','today','','2019-06-06','',0,0,'');

/* Trigger structure for table `properties` */

DELIMITER $$

/*!50003 DROP TRIGGER*//*!50032 IF EXISTS */ /*!50003 `properties_delete_trigger` */$$

/*!50003 CREATE */ /*!50017 DEFINER = 'root'@'localhost' */ /*!50003 TRIGGER `properties_delete_trigger` BEFORE DELETE ON `properties` FOR EACH ROW BEGIN
	delete from `property_photos` where `property_id` = OLD.id;
    END */$$


DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
