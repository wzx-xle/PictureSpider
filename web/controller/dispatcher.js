var queryStr = require('querystring');
var url = require('url');

var dispatcher = {};

dispatcher.dispatch = function(req, resp) {
    var uri = url.parse(req.url).pathname;
    var query = queryStr.parse(url.parse(req.url).query);
    
    console.log('uri:' + uri + '?query:');
    console.log(query);
    resp.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
    resp.write('uri:' + uri + '?query:' + JSON.stringify(query));
    resp.end();
}

module.exports = dispatcher;