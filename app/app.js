var common = require('../cmn/common');
var Model = require('../cmn/model');

var utils = common.utils;
var config = common.config;

// 小组ID集合
var groups = config.app.groups;

var model = new Model();

console.time('timer');
model.init();
model.tags.queryById(1, function (err, res) {
    //if (err) throw err;
    console.log(res);
    console.log('access mysql successful.');
});

console.timeEnd('timer');
utils.timer(1000, function () {
    debugger;
    model.tags.queryById(1, function (err, res) {
        if (err) throw err;
        console.log(res);
        console.log('access mysql successful.');
    });

    console.timeEnd('timer');
    console.time('timer');
});

model.destry();