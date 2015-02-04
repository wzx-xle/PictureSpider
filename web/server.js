var http = require('http');
var fs = require('fs');
var path = require('path');

var url = require('url');

var common = require('../cmn/common');
var dispatcher = require('./controller/dispatcher');
var mime = require('./mime');

var webCfg = common.config.web;

http.createServer(function (req, resp) {
    debugger;
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

                resp.writeHead('404', {'Content-Type': 'text/html'});
                fs.readFile(__dirname + '/www/view/err/404.html', function (err, data) {
                    resp.end(data);
                })
                return;
            }
            console.log('request static file ' + localPath + ' successful.');

            resp.writeHead('200', {'Content-Type': contentType});
            resp.end(data);
        });
    }
})
.listen(webCfg.listen.port, webCfg.listen.host);

console.log('Server running at http://'+ webCfg.listen.host + ':' + webCfg.listen.port + '/')