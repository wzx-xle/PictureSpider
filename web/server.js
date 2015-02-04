var http = require('http');

http.createServer(function (req, resp) {
    resp.writeHead('200', {'Content-Type': 'text/plain'});
    resp.end('\nhello world!');
}).listen(8088);
console.log('Server running at http://localhost:8088/')