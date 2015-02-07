var common = require('../cmn/common');
var Model = require('../cmn/model');

var utils = common.utils;
var config = common.config;

// 小组ID集合
var groups = config.app.groups;
// 数据访问模型
var model = new Model();

// 循环检查
utils.timer(1000, function () {

});