var common = require('../cmn/common');
var Utils = require('./Utils');

var config = common.config;

// 小组ID集合
var groups = config.app.groups;

console.time('timer');
Utils.timer(1000, function() {
    
    
    
    console.timeEnd('timer');
    console.time('timer');
})