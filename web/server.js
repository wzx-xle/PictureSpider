var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var common = require('../cmn/common');
var model = common.model;
var utils = common.utils;
var dispatcher = require('./controller/dispatcher');
var error = require('./controller/error');
var mime = require('./mime');

var webCfg = common.config.web;

// 过滤规则
var rules = {
    ip: [],
    topic: []
};

/**
 * 初始化规则集合
 * @param {Function} callback 初始化完成后触发
 */
var updateRules = function (callback) {
    // 查询数据的规则集合
    model.rules.queryAll(function (err, rows) {
        if (err) {
            console.error(err);
            return;
        }

        var tmp_ip = [];
        var tmp_topic = [];

        // 初始化规则列表
        for (var i in rows) {
            var row = rows[i];
            var rule = {
                rule: row['rule'],
                type: row['type']
            };
            if (row.name == 'ip') {
                tmp_ip.push(rule);
            } else if (row.name == 'topic') {
                tmp_topic.push(rule);
            }
        }

        rules.ip = tmp_ip;
        rules.topic = tmp_topic;

        if (callback) {
            callback();
        }
    });
};

/**
 * HTTP服务器请求处理
 * @param {Object} req  请求对象
 * @param {Object} resp 响应对象
 */
var httpServer = function (req, resp) {
    //debugger;
    var clientIp = utils.getClientIp(req);
    console.log('request ' + req.method + ' ' + clientIp + ' ' + req.url);

    // 检查IP地址是否在许可集合中
    if (!utils.checkRule(clientIp, rules.ip)) {
        error.e403(resp);
        return;
    }
    var reqUrl = req.url;
    if (reqUrl.indexOf('/controller') == 0) {
        // 过滤掉开头的 /controller 路径
        req.url = req.url.substr(11);
        // 调用控制器分发请求
        dispatcher.dispatch(req, resp);
    }
    else {
        reqUrl = url.parse(req.url).pathname;
        // 设置默认展示首页
        if (reqUrl.indexOf('/') == 0 && reqUrl.length == 1) {
            reqUrl = '/index.html';
        }
        // 解析到本地路径
        var localPath = __dirname + "/www" + reqUrl;
        if (reqUrl.indexOf('/picture') == 0) {
            localPath = common.config.picDir + reqUrl.substr(8);
        }
        // 设置 Content-Type
        var extName = path.extname(reqUrl);
        extName = extName ? extName.slice(1) : 'unknow';
        var contentType = mime.types[extName] || 'text/plain';

        // 读取静态文件
        fs.readFile(localPath, function (err, data) {
            if (err) {
                console.log('request static file ' + localPath + ' not found.');
                error.e404(resp);
                return;
            }

            resp.writeHead('200', {'Content-Type': contentType});
            resp.end(data);
        });
    }
};

/**
 * 启动HTTP服务器
 */
var runServer = function () {
    http.createServer(httpServer).listen(webCfg.listen.port, webCfg.listen.host);
    console.log('Server running at http://'+ webCfg.listen.host + ':' + webCfg.listen.port + '/')
};

// 初始化规则后启动HTTP服务器
updateRules(runServer);

// 定时更新规则
utils.timer(1000 * 10, updateRules);