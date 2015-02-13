var queryStr = require('querystring');

var url = require('url');

var common = require('../../cmn/common');
var error = require('./error');

var model = common.model;
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
            var params = {};
            params['startId'] = query['startId'] ? parseInt(query['startId']) : null;
            params['limit'] = query['limit'] ? parseInt(query['limit']) : 10;

            model.pictures.queryPage(params, function (err, rows) {
                for (var i in rows) {
                    rows[i].file = rootUrl + rows[i].file;
                }
                respContent['pictures'] = rows;
                if (rows.length == 0) {
                    respContent['status'] = 1;
                }
                end(resp, respContent);
            });
            break;

        default:
            error.e404(resp);
    }
};

var end = function (resp, content) {
    resp.writeHead(200, {
        'Content-Type': 'text/json; charset=utf-8'
    });
    var respContent = JSON.stringify(content);
    resp.end(respContent);
};

process.on('SIGINT', function () {
    setTimeout(function () {
        model.destroy();
    }, 100).unref();
});

module.exports = dispatcher;