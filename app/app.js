var common = require('../cmn/common');
var Model = require('../cmn/model');

var Utils = common.Utils;
var config = common.config;

// 小组ID集合
var groups = config.app.groups;

var model = new Model();

model.init();

model.tags.queryById(1, function (err, res) {
    console.log(res);
    console.log('access mysql successful.');
});

model.destry();

//console.time('timer');
//Utils.timer(1000, function() {
//
//
//
//    console.timeEnd('timer');
//    console.time('timer');
//});

