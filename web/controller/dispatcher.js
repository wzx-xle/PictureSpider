var queryStr = require('querystring');
var fs = require('fs');

var url = require('url');

var common = require('../../cmn/common');
var model = require('../../cmn/model');

var dispatcher = {};

dispatcher.dispatch = function (req, resp) {
    var uri = url.parse(req.url).pathname;
    var query = queryStr.parse(url.parse(req.url).query);
    // 合并参数
    for (var key in req.query) {
        query[key] = req.query[key];
    }

    console.log('uri:' + uri + '?query:' + JSON.stringify(query));

    var respContent = {};
    respContent['status'] = 0;
    switch (uri) {
        case '/getPictures':
            var rootUrl = '/picture/';
            model.pictures.queryAll(function (err, rows) {
                for (var i in rows) {
                    rows[i].file = rootUrl + rows[i].file;
                }
                respContent['pictures'] = rows;
                end(resp, respContent);
            });
            break;

        default:
            e404(resp);
    }
};

var end = function (resp, content) {
    resp.writeHead(200, {
        'Content-Type': 'text/json; charset=utf-8'
    });
    var respContent = JSON.stringify(content);
    console.log('resp:' + respContent);
    resp.end(respContent);
};

var e404 = function (resp) {
    resp.writeHead('404', {
        'Content-Type': 'text/html'
    });
    
    fs.readFile(__dirname + '/../www/view/err/404.html', function (err, data) {
        resp.end(data);
    });
};

process.on('SIGINT', function () {
    setTimeout(function () {
        model.destroy();
    }, 100).unref();
});

module.exports = dispatcher;