var common = require('../cmn/common');
var Model = require('../cmn/model');

var utils = common.utils;
var config = common.config;

// 小组ID集合
var groups = config.app.groups;

var model = new Model();

console.time('timer');
model.tags.queryById(4, function (err, rows) {
    if (err) throw err;
    console.log(rows);
    console.log('access mysql successful.');
});

console.timeEnd('timer');
utils.timer(10, function () {
    debugger;
    model.tags.queryAll(function (err, rows) {
        if (err) throw err;
        console.log(rows);
        console.log('access mysql successful.');
    });

    console.timeEnd('timer');
    console.time('timer');
});