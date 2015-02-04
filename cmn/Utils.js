var path = require('path');
var fs = require('fs');

var Utils = {};

/**
 * 同步方式创建路径，包括不存在的父目录
 * @param {String}   dirPath  目录
 * @param {Number}   model    目录权限，默认0777
 * @param {Function} callback 回调函数
 */
Utils.mkdirsSync = function (dirPath, model, callback) {
    try {
        if (!path.existsSync(dirPath)) {
            var parentDir = path.dirname(dirPath);
            if (path.existsSync(parentDir)) {
                fs.mkdirSync(dirPath, model);
                callback();
            } else {
                Utils.mkdirs(parentDir, model, function (err) {
                    if (err) callback(err);
                    
                    fs.mkdirSync(dirPath, model);
                    callback();
                });
            }
        }
    } catch (err) {
        callback(err);
    }
};

/**
 * 定时器，在回调函数执行完成后，做下一次定时操作
 * @param {Number}   time     周期
 * @param {Function} callback 回调函数
 */
Utils.timer = function (time, callback) {
    var self = function() {
        callback();
        setTimeout(self, time);
    }
    setTimeout(self, time);
}

module.exports = Utils;