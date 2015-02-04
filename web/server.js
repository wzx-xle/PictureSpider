var http = require('http');
var fs = require('fs');
var path = require('path');

var dispatcher = require('./controller/dispatcher');

var contentTypes = require('./contentTypes.json');

http.createServer(function (req, resp) {
    debugger;
    var reqUrl = req.url;
    if (reqUrl.indexOf('/controller') == 0) {
        dispatcher.dispatch(req, resp);
    }
    else {
        // 设置默认展示首页
        if (reqUrl.indexOf('/') == 0 && reqUrl.length == 1) {
            reqUrl = '/index.html';
        }
        // 解析到本地路径
        var localPath = __dirname + "/www" + reqUrl;
        // 设置 Content-Type
        var extName = path.extname(reqUrl);
        var contentType = contentTypes[extName];

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
.listen(8088);
console.log('Server running at http://localhost:8088/')