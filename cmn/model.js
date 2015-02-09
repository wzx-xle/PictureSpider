var common = require('./common');

var pool = common.mysql.createPool(common.config.db);

module.exports = {

    tags: {
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
    },

    destroy: function (callback) {
        pool.end(callback);
    }
};