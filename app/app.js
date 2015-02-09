var superagent = require('superagent');
var cheerio = require('cheerio');

var common = require('../cmn/common');
var model = require('../cmn/model');

var utils = common.utils;
var config = common.config;

// 小组ID集合
var groups = config.app.groups;
// 小组URL模版
var groupUrlTemplate = config.app.groupUrlTemplate;
var groupReferer = config.app.groupReferer;
var maxPage = config.app.maxPage;

// 定时检查
utils.timer(1000 * config.app.groups.length, function () {

    // 循环变量所有小组
    utils.timerFor(1000, config.app.groups, function (group) {
        for (var i = 0; i < maxPage; i++) {
            var url = groupUrlTemplate.replace('{1}', group).replace('{2}', i * 50);
        }
    });
});