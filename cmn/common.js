// 公共模块对象
var Common = {};

Common.config = require('./config.json');
Common.mysql = require('mysql');

module.exports = Common;