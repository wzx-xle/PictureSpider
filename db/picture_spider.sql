/*
Navicat MySQL Data Transfer

Source Server         : localhost_root
Source Server Version : 50535
Source Host           : localhost:3306
Source Database       : picture_spider

Target Server Type    : MYSQL
Target Server Version : 50535
File Encoding         : 65001

Date: 2015-02-12 14:52:19
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `pictures`
-- ----------------------------
DROP TABLE IF EXISTS `pictures`;
CREATE TABLE `pictures` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `topicId` int(10) NOT NULL COMMENT '图片所在帖子的Id',
  `file` varchar(255) NOT NULL COMMENT '图片文件的保存位置，相对路径',
  `laud` smallint(5) unsigned DEFAULT '0' COMMENT '赞的数量',
  `tread` smallint(5) DEFAULT '0' COMMENT '踩的数量',
  `url` varchar(255) DEFAULT '' COMMENT '图片来源',
  `isLocal` tinyint(1) DEFAULT '1' COMMENT '是否保存在本地，1表示本地，0表示远程',
  `insertTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=264 DEFAULT CHARSET=utf8 COMMENT='图片集';

-- ----------------------------
-- Table structure for `picture_tag`
-- ----------------------------
DROP TABLE IF EXISTS `picture_tag`;
CREATE TABLE `picture_tag` (
  `pictureId` int(10) NOT NULL DEFAULT '0' COMMENT '图片ID',
  `tagId` int(10) NOT NULL DEFAULT '0' COMMENT '标签ID',
  PRIMARY KEY (`pictureId`,`tagId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='保存标签和图片的对应关系';

-- ----------------------------
-- Table structure for `rules`
-- ----------------------------
DROP TABLE IF EXISTS `rules`;
CREATE TABLE `rules` (
  `id` int(5) unsigned NOT NULL AUTO_INCREMENT COMMENT '唯一标识符，自增',
  `name` varchar(20) NOT NULL COMMENT '规则名称，显示用，可重复',
  `rule` varchar(100) NOT NULL COMMENT '具体规则，也就是正则表达式',
  `type` tinyint(1) DEFAULT '0' COMMENT '规则类型，0表示不能存在，1表示存在',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of rules
-- ----------------------------
INSERT INTO `rules` VALUES ('1', 'ip', '127.0.0.1', '1');
INSERT INTO `rules` VALUES ('2', 'ip', 'localhost', '1');

-- ----------------------------
-- Table structure for `tags`
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '标签的唯一ID',
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='标签表';

-- ----------------------------
-- Table structure for `topics`
-- ----------------------------
DROP TABLE IF EXISTS `topics`;
CREATE TABLE `topics` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '帖子的标题',
  `url` varchar(255) NOT NULL COMMENT '帖子的URL',
  `authorId` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8 COMMENT='帖子集合';
