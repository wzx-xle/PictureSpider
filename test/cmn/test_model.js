var model = require('../../cmn/model');

console.time('timer');
model.tags.queryAll(function (err, rows) {
    if (err) throw err;
    console.log(rows);
    console.log('access mysql successful.');

    model.destroy();
    console.timeEnd('timer');
});