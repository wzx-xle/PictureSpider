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
var maxPage = config.app.maxPage;

// cookies
var cookies = [""];

// 请求头参数
var groupReferer = config.app.groupReferer;
var currCookie = 0;

/**
 * 初始化访问的cookie列表
 * @param {String} dir cookies的保存路径
 */
var initCookie = function (dir) {
    var files = utils.getFilesSync(dir);
    for (var i = 0; i < files.length; i++) {
        var cookie = utils.readFileSync(files[i]);
        if ("" != cookie) {
            cookies.push(cookie);
        }
    }
}

/**
 * 切换cookie
 */
var switchCookie = function () {
    if (currCookie == cookies.length) {
        currCookie = 0;
    }
    else {
        currCookie++;
    }
}

debugger;
// 定时检查
utils.timer(5 * 1000 * groups.length, function () {
    var groupPageUrls = [];
    for (var i = 0; i < groups.length; i++) {
        var groupId = groups[i];
        for (var j = 0; j < maxPage; j++) {
            var url = groupUrlTemplate.replace('{1}', groupId).replace('{2}', j * 25);
            groupPageUrls.push(url);
        }
    }
    console.log(groupPageUrls);

    var topics = [];
    utils.timerFor(1000, groupPageUrls, function (groupUrl) {
        superagent.get(url).end(function (err, sres) {
            if (err) {
                console.error(err);
            }

            var $ = cheerio.load(sres.text);
            var result = $('.olt .title a');
            if (result && result.length != 0) {
                result.each(function (k, v) {
                    topics.push({
                        refer: groupUrl,
                        url: v.attribs['href']
                    });
                });
            }
            else {
                switchCookie();
            }

            console.log("topics:" + topics.length);
        });
    });

    return;

    // 循环变量所有小组
    utils.timerFor(1000, config.app.groups, function (group) {
        var topics = [];
        var groupPages = [];
        for (var i = 0; i < maxPage; i++) {
            var url = groupUrlTemplate.replace('{1}', group).replace('{2}', i * 25);
            console.log('url:' + url);
            superagent.get(url).end(function (err, sres) {
                if (err) {
                    console.error(err);
                }

                var $ = cheerio.load(sres.text);
                $('.olt .title a').each(function (k, v) {
                    topics.push(v.attribs['href']);
                });

                console.log("topics:" + topics.length);
            });
        }
    });
});