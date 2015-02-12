
module.exports = {
    e404: function (resp) {
        resp.writeHead('404', {
            'Content-Type': 'text/html'
        });

        fs.readFile(__dirname + '/../www/view/err/404.html', function (err, data) {
            resp.end(data);
        });
    }
}