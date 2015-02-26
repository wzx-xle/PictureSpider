// 系统模块
var path = require('path');
var fs = require('fs');

// 第三方模块
var superagent = require('superagent');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var eventproxy = require('eventproxy');

// 本地模块
var common = require('../cmn/common');

var model = common.model;
var utils = common.utils;
var config = common.config;
var doubanCfg = config.app.douban;

// 本地文件保存路径
var picDir = config.picDir;

// 小组ID集合
var groups = doubanCfg.groups;
// 小组URL模版
var groupUrlTemplate = doubanCfg.groupUrlTemplate;
var maxPage = doubanCfg.maxPage;
// 定时周期
var timeCfg = doubanCfg.time;
var time_all = timeCfg.all instanceof Array ? timeCfg.all : [parseInt(timeCfg.all)];
var time_groupPage = timeCfg.groupPage instanceof Array ? timeCfg.groupPage : [parseInt(timeCfg.groupPage)];
var time_topic = timeCfg.topic instanceof Array ? timeCfg.topic : [parseInt(timeCfg.topic)];

// 请求头参数
var groupReferer = doubanCfg.groupReferer;
var browserCommonHeader = doubanCfg.browserCommonHeader;

// cookies
var cookies = [""];
var currCookie = 0;

// 帖子链接
var topics = [];
// 小组访问链接
var groupPageUrls = [];

// 同步控制
var ep = new eventproxy();

// 设置HTTP代理头
var setCommonHeader = function (req) {
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
                refer: groupReferer.replace('{1}', groupId),
                groupId: groupId
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
            console.error('html request ' + err);
            return;
        }
        if (sres.status != 200) {
            switchCookie();
            return;
        }
        if (callback) {
            callback(cheerio.load(sres.text));
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
    for (var k in browserCommonHeader) {
        options.headers[k.replace('_', '-')] = browserCommonHeader[k];
    }
    options.headers['Referer'] = reqArgs.refer;
    options.headers['Cookie'] = cookies[currCookie];

    var localFile = path.join(picDir, reqArgs.file);
    // 文件存在，则不下载
    if (fs.existsSync(localFile)) {
        if (callback) {
            delete reqArgs.file;
            callback(null, reqArgs);
        }
        return;
    }
    utils.mkdirsSync(path.dirname(localFile));
    request
        .get(reqArgs.url, options)
        .on('response', function (resp) {
            if (resp.statusCode == 200) {
                if (callback) {
                    callback(null, reqArgs);
                }
            }
        })
        .on('error', function (err) {
            if (fs.existsSync(localFile)) {
                fs.unlinkSync(localFile);
            }
            if (callback) {
                callback(err, reqArgs);
            }
        })
        .pipe(fs.createWriteStream(localFile));
};

// 设置执行队列，解析帖子内容，并下载图片
var queue = async.queue(function (task, callback) {
    htmlRequest(task, function ($) {
        console.log('\nt ' + task.url);

        // 帖子模型
        var topicModel = {};
        topicModel['url'] = task.url;
        topicModel['title'] = $('#content>h1').text().trim();
        topicModel['authorId'] = $('#content .from>a').attr('href');
        if (topicModel.authorId) {
            topicModel['authorId'] = topicModel.authorId.match('group/people/([a-zA-Z0-9_$]+)')[1];
        }
        else {
            console.log('无法获取作者ID')
        }

        // 图片模型集合
        var pictureModels = [];
        $('#content .topic-content img:not(.pil)').each(function (k, v) {
            var url = v.attribs.src;
            var file = 'douban/' + task.groupId + '/';
            file += topicModel['authorId'] + '_' + url.match('p[0-9]{3,9}.[a-zA-Z_]+')[0];

            pictureModels.push({
                url: url,
                file: file
            });
        });

        // 没有图片，则不下载和保存
        if (pictureModels.length == 0) {
            if (callback) {
                callback();
            }
            return;
        }

        var _topicId = task.url.match('topic/([a-zA-Z0-9_$]{7,})/')[1];

        // 图片下载完成后保存到数据库
        ep.after('picture_' + _topicId, pictureModels.length, function (models) {
            // 将帖子信息插入数据
            model.topics.insert(topicModel, function (err, rows) {
                if (err) {
                    console.error('topic insert ' + err);
                    return;
                }

                var topicId = rows.insertId;
                for (var i in models) {
                    var picture = models[i];
                    if (!picture) {
                        continue;
                    }
                    picture['topicId'] = topicId;

                    model.pictures.insert(picture, function (err, rows) {
                        if (err) {
                            console.error('picture insert ' + err);
                            return;
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

        // 下载图片
        for (var i in pictureModels) {
            var picture = utils.clone(pictureModels[i]);
            picture.refer = task.url;
            pictureRequest(picture, function (err, reqArgs) {
                if (err) {
                    console.error('picture request ' + err);
                }
                if (reqArgs['file']) {
                    console.log('p ' + reqArgs.url);
                    console.log('  ==> ' + reqArgs.file);

                    delete reqArgs.refer;
                    ep.emit('picture_' + _topicId, reqArgs);
                }
                else {
                    ep.emit('picture_' + _topicId)
                }
            });
        }
    });
}, 1);

initCookie('cookies');
createGroupPageUrls();

/**
 * 定时向帖子队列中添加下载信息
 */
utils.timer(function () {
    return utils.random(time_topic[0], time_topic[1]) * 1000;
}, function () {
    if (topics.length > 0) {
        queue.push(topics.shift());
    }
});

// 定时检查，5min 1000 * 60 * 5 * groups.length
utils.timer(function () {
    var time = utils.random(time_all[0], time_all[1]);
    console.log('time_all=' + time);
    return time * 1000;
}, function () {
    // 定时获取帖子列表
    utils.timerFor(function () {
        var time = utils.random(time_groupPage[0], time_groupPage[1]);
        console.log('time_groupPage=' + time);
        return time * 1000;
    }, utils.clone(groupPageUrls), function (groupUrl) {
        htmlRequest(groupUrl, function ($) {
            console.log('\ng ' + groupUrl.url);

            var result = $('.olt .title a');
            if (result && result.length != 0) {
                result.each(function (k, v) {
                    topics.push({
                        refer: groupUrl.url,
                        url: v.attribs['href'],
                        groupId: groupUrl.groupId
                    });
                });
            } else {
                switchCookie();
            }

            console.log("topics:" + topics.length);
        });
    });
});