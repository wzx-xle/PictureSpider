// 公共模块对象
var Common = {};

Common.config = require('./config.json');
Common.mysql = require('mysql');

Common.Utils = require('./Utils');

module.exports = Common;