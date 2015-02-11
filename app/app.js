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

// 帖子链接
var topics = [];
// 小组访问链接
var groupPageUrls = [];

// 设置HTTP代理头
var setCommonHeader = function (req) {
    var browserCommonHeader = config.app.browserCommonHeader;
    for (var k in browserCommonHeader) {
        req.set(k.replace('_', '-'), browserCommonHeader[k]);
    };
};

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
};

/**
 * 切换cookie
 */
var switchCookie = function () {
    if (currCookie == cookies.length) {
        currCookie = 0;
    } else {
        currCookie++;
    }
};

// 计算访问的链接
var createGroupPageUrls = function () {
    for (var i = 0; i < groups.length; i++) {
        var groupId = groups[i];
        for (var j = 0; j < maxPage; j++) {
            var url = groupUrlTemplate.replace('{1}', groupId).replace('{2}', j * 25);
            groupPageUrls.push({
                url: url,
                refer: groupReferer.replace('{1}', groupId)
            });
        }
    }
    console.log(groupPageUrls);
};

initCookie('cookies');
createGroupPageUrls();

debugger;
// 定时检查，5min
utils.timer(5 * 60 * 1000 * groups.length, function () {

    // 定时获取帖子列表
    utils.timerFor(1000 * 60, utils.clone(groupPageUrls), function (groupUrl) {
        var req = superagent.get(groupUrl.url);
        setCommonHeader(req);
        req
            .set("Referer", groupUrl.refer)
            .set("Cookie", cookies[currCookie])
            .end(function (err, sres) {
                if (err) {
                    console.error(err);
                }
                debugger;
                var $ = cheerio.load(sres.text);
                var result = $('.olt .title a');
                if (result && result.length != 0) {
                    result.each(function (k, v) {
                        topics.push({
                            refer: groupUrl.url,
                            url: v.attribs['href']
                        });
                    });
                } else {
                    switchCookie();
                    return false;
                }

                console.log("topics:" + topics.length);
                console.log(topics);
            });
    });
});