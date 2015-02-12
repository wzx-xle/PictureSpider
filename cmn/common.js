// 公共模块对象
var common = {};

common.config = require('./config.json');
common.utils = require('./utils');
common.model = require('./model');

module.exports = common;