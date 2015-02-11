// 系统模块
var path = require('path');
var fs = require('fs');

// 第三方模块
var superagent = require('superagent');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

// 本地模块
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
        if (cookie.length != 0) {
            cookies.push(cookie.toString());
        }
    }
    if (cookies.length != 1) {
        cookies.shift();
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

/**
 * 发起html请求
 * @param {Object}   reqArgs  请求参数
 * @param {Function} callback 请求完成后的回调函数
 */
var htmlRequest = function (reqArgs, callback) {
    var req = superagent.get(reqArgs.url);
    setCommonHeader(req);
    req.set("Referer", reqArgs.refer).set("Cookie", cookies[currCookie]).end(function (err, sres) {
        if (err) {
            console.error(err);
        }
        if (sres.status != 200) {
            switchCookie();
            return;
        }
        if (callback) {
            callback(err, sres);
        }

    });
};

/**
 * 请求图片
 * @param {Object}   reqArgs  请求参数
 * @param {Function} callback 回调函数
 */
var pictureRequest = function (reqArgs, callback) {
    var options = {};
    options['headers'] = {};
    var browserCommonHeader = config.app.browserCommonHeader;
    for (var k in browserCommonHeader) {
        options.headers[k.replace('_', '-')] = browserCommonHeader[k];
    }
    options.headers['Referer'] = reqArgs.refer;
    options.headers['Cookie'] = cookies[currCookie];

    var localFile = path.join(config.picDir, reqArgs.file);
    // 文件存在，则不下载
    if (fs.existsSync(localFile)) {
        if (callback) {
            callback();
        }
    }
    utils.mkdirsSync(path.dirname(localFile));
    request
        .get(reqArgs.url, options)
        .on('response', function (resp) {
            if (resp.statusCode == 200) {
                if (callback) {
                    callback();
                }
            }
        })
        .on('error', function (err) {
            if (fs.existsSync(localFile)) {
                fs.unlinkSync(localFile);
            }
            if (callback) {
                callback(err);
            }
        })
        .pipe(fs.createWriteStream(localFile));
};

// 设置执行队列，解析帖子内容，并下载图片
var queue = async.queue(function (task, callback) {
    htmlRequest(task, function (err, sres) {
        var $ = cheerio.load(sres.text);

        // 帖子模型
        var topicModel = {};
        topicModel['url'] = task.url;
        topicModel['title'] = $('#content>h1').text().trim();
        topicModel['authorId'] = $('#content .from>a').attr('href').match('group/people/([a-zA-Z0-9_$]+)/')[1];

        // 图片模型集合
        var pictureModels = [];
        $('#content .topic-content img:not(.pil)').each(function (k, v) {
            var url = v.attribs.src;
            var file = 'douban/' + utils.date2str() + '/';
            file += topicModel['authorId'] + '_' + url.match('p[0-9]{3,9}.jpg')[0];

            pictureModels.push({
                url: url,
                file: file
            });
        });

        // 下载图片
        for (var i = 0; i < pictureModels.length; i++) {
            var picture = utils.clone(pictureModels[i]);
            picture.refer = task.url;
            pictureRequest(picture, function () {
                console.log(picture.url);
            });
        }

        // 将帖子信息插入数据
        model.topics.insert(topicModel, function (err, rows) {
            if (err) throw err;
            var topicId = rows.insertId;
            for (var i = 0; i < pictureModels.length; i++) {
                var picture = pictureModels[i];
                picture['topicId'] = topicId;
                model.pictures.insert(picture, function (err, rows) {
                    if (err) {
                        console.error(err);
                    }

                    if (!rows.insertId) {
                        console.log('picture insert faild !' + JSON.stringify(picture))
                    }
                });
            }
        });

        if (callback) {
            callback();
        }
    });
}, 1);

initCookie('cookies');
createGroupPageUrls();

/**
 * 定时向帖子队列中添加下载信息
 */
utils.timer(1000 * 1, function () {
    if (topics.length > 0) {
        queue.push(topics.shift());
    }
});

debugger;
// 定时检查，5min
utils.timer(1000 * 60 * 5 * groups.length, function () {

    // 定时获取帖子列表
    utils.timerFor(1000 * 60 * 5, utils.clone(groupPageUrls), function (groupUrl) {
        htmlRequest(groupUrl, function (err, sres) {
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
            }

            console.log("topics:" + topics.length);
        });
    });
});