// 公共模块对象
var common = {};

common.config = require('./config.json');
common.mysql = require('mysql');

common.utils = require('./utils');

module.exports = common;