var common = require('./common');
module.exports = function () {
    var pool = common.mysql.createPool(common.config.db);

    this.tags = {
        queryById: function (id, callback) {
            pool.query('select * from tags where id=?', [id], function (err, rows, fields) {
                callback(err, rows);
            });
        },
        queryAll: function (callback) {
            pool.query('select * from tags', function (err, rows, fields) {
                callback(err, rows);
            });
        }
    };

    this.destroy = function (callback) {
        pool.end(callback);
    };
};