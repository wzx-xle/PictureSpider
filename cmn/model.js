var common = require('./common');

module.exports = function () {
    var conn = null;

    this.init = function () {
        conn = common.mysql.createConnection({
            host: common.config.db.host,
            port: common.config.db.port,
            user: common.config.db.user,
            password: common.config.db.password,
            database: common.config.db.database
        });
    };

    this.tags = {
        queryById: function (id, callback) {
            conn.query('select * from tags where id=?', [id], function (err, res, fields) {
                callback(res, res);
            });
        }
    };

    this.queryAll = function (callback) {
        conn.query('select * from tags', function (err, res, fields) {
            console.log(res);
        });
    };

    this.destry = function (callback) {
        conn.end(callback);
    };
};