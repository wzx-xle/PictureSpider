var model = require('../../cmn/model');

console.time('timer');
model.tags.queryAll(function (err, rows) {
    if (err) throw err;
    console.log(rows);
    console.log('access mysql successful.');

    console.timeEnd('timer');
});

process.on('SIGINT', function() {
    setTimeout(function () {
        model.destroy();
    }, 100).unref();
});