var utils = require('../../cmn/utils');

// test timerFor
//console.time('timer');
//utils.timerFor(1000, ['0', '1', '2'], function (item) {
//    console.log(item);
//    console.timeEnd('timer');
//});

function test_date2str() {
    var day = new Date();
    utils.date2str();
}