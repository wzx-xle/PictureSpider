var config = require('./config.json');
var mysql = require('mysql');

var pool = mysql.createPool(config.db);

// 查询格式处理，支持直接写对象
pool.config.connectionConfig.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};

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
            var sql = 'SELECT * FROM pictures WHERE id <= :startId ORDER BY id DESC LIMIT :limit';
            var params = [];
            if (!query.startId) {
                sql = 'SELECT * FROM pictures WHERE id <= (select max(id) from pictures) ORDER BY id DESC LIMIT :limit';
            }

            pool.query(sql, query, function (err, rows, fields) {
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

    rules: {
        queryByName: function (query, callback) {

        },
        queryAll: function (callback) {
            pool.query('SELECT * FROM rules', function (err, rows, fields) {
                callback(err, rows);
            });
        }
    },

    destroy: function (callback) {
        pool.end(callback);
    }
};