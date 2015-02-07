var Model = require('../../cmn/model');

var model = new Model();

console.time('timer');
model.tags.queryById(4, function (err, rows) {
    if (err) throw err;
    console.log(rows);
    console.log('access mysql successful.');
});

console.timeEnd('timer');