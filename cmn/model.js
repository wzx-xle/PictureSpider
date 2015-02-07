var common = require('./common');

module.exports = function () {
    var conn = null;

    this.init = function () {
        conn = common.mysql.createConnection(common.config.db);
    };

    this.tags = {
        queryById: function (id, callback) {
            conn.query('select * from tags where id=?', [id], function (err, rows, fields) {
                callback(err, rows);
            });
        }
    };

    this.queryAll = function (callback) {
        conn.query('select * from tags', function (err, rows, fields) {
            console.log(rows);
        });
    };

    this.destry = function (callback) {
        conn.end(callback);
    };
};