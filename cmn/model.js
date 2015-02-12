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
        queryPage: function (query, callback) {
            var sql = 'SELECT * FROM pictures WHERE id <= ? ORDER BY id DESC LIMIT ?';
            var params = [];
            if (!query.startId) {
                sql = 'SELECT * FROM pictures WHERE id <= (select max(id) from pictures) ORDER BY id DESC LIMIT ?';
                params.push(parseInt(query.limit));
            }
            else {
                params.push(parseInt(query.startId));
                params.push(parseInt(query.limit));
            }

            pool.query(sql, params, function (err, rows, fields) {
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