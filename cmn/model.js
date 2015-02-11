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
    pictures: {
        queryAll: function (callback) {
            pool.query('select * from pictures', function (err, rows, fields) {
                callback(err, rows);
            });
        },
        insert: function (model, callback) {
            pool.query('insert into pictures set ?', model, function (err, rows, fields) {
                callback(err, rows);
            });
        }
    },

    topics: {
        insert: function (model, callback) {
            pool.query('insert into topics set ?', model, function (err, rows, fields) {
                callback(err, rows);
            });
        }
    },

    destroy: function (callback) {
        pool.end(callback);
    }
};