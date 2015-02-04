var dispatcher = {};

dispatcher.dispatch = function(req, resp) {
    console.log('url=' + req.url);
    resp.end('\nurl=' + req.url + '\n');
}

module.exports = dispatcher;