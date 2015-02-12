var path = require('path');
var fs = require('fs');

var utils = {};

/**
 * 同步方式创建路径，包括不存在的父目录
 * @param {String}   dirPath  目录
 * @param {Number}   model    目录权限，默认0777
 */
utils.mkdirsSync = function (dirPath, model) {
    debugger;
    if (!fs.existsSync(dirPath)) {
        var parentDir = path.dirname(dirPath);
        utils.mkdirsSync(parentDir, model);
        fs.mkdirSync(dirPath, model);
    }
};

/**
 * 获取目录下的所有文件，不包含子目录
 * @param {String} dir 目录路径
 * @param {Array}  文件数组
 */
utils.getFilesSync = function (dir) {
    var res = [];
    if (fs.existsSync(dir)) {
        var files = fs.readdirSync(dir);
        for (var i = 0; i < files.length; i++) {
            var file = path.join(dir, files[i]);
            if (fs.statSync(file).isFile()) {
                res.push(file);
            }
        }
    }

    return res;
}

/**
 * 读取文件内容
 * @param   {String} filePath 文件路径
 * @param   {Object} options  文件读取参数，默认为utf-8
 * @returns {String} 文件内容，转换到字符串
 */
utils.readFileSync = function (filePath, options) {
    if (!filePath || !fs.existsSync(filePath)) {
        return "";
    }

    return fs.readFileSync(filePath, options);
}

/**
 * 定时器，在回调函数执行完成后，做下一次定时操作
 * @param {Number}   time     周期
 * @param {Function} callback 回调函数
 */
utils.timer = function (time, callback) {
    var self = function () {
        callback();
        setTimeout(self, time);
    }
    
    self();
};

/**
 * 定时循环，相当于在for循环中增加sleep方法，在回调函数返回false时，顺序不可测
 * @param {Number}   time     每次循环暂停的时间
 * @param {Array}    params   参数数组
 * @param {Function} callback 回调函数
 */
utils.timerFor = function (time, params, callback) {
    var self = function () {
        if (params.length > 0) {
            var param = params.shift();
            if (callback(param) == false) {
                params.push(param);
            }
            setTimeout(self, time);
        }
    };
    
    self();
};

/**
 * 复制对象，深拷贝
 * @param   {Object} srcObj 被拷贝的对象
 * @returns {Object} 拷贝出来的对象
 */
utils.clone = function (srcObj) {
    var buf;
    if (srcObj instanceof Array) {
        buf = [];
        var i = srcObj.length;
        while (i--) {
            buf[i] = utils.clone(srcObj[i]);
        }
        return buf;
    }
    else if (srcObj instanceof Object) {
        buf = {};
        for (var k in srcObj) {
            buf[k] = utils.clone(srcObj[k]);
        }
        return buf;
    }
    else {
        return srcObj;
    }
};

/**
 * 将日期转换为字符串 yyyyMMdd
 * @param   {Object} date 日期对象，不传或null，使用当天日期
 * @returns {String} 日期字符串 20130103
 */
utils.date2str = function (date) {
    if (!date) {
        date = new Date();
    }

    var year = date.getFullYear() + '';

    var month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;

    var day = date.getDate();
    day = day < 10 ? '0' + day : day;

    return year + month + day;
};

/**
 * 获取客户端IP地址
 * @param   {Object} req 请求对象
 * @returns {String} IP地址
 */
utils.getClientIp = function (req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

/**
 * 校验给定字符串是否满足规则，type=1的规则间为或关系，type=0的规则与type=1的规则与关系
 * @param {String} data  被校验的字符串
 * @param {Array}  rules 规则集合，集合对象包含两个属性，rule:{正则表达式}, type:{0表示非|1表示存在}
 */
utils.checkRule = function (data, rules) {
    if (rules.length == 0) {
        return true;
    }
    debugger;
    var isMatch = false;
    // 校验每一个规则
    for (var i in rules) {
        if (data.match(rules[i].rule)) {
            if (rules[i].type == 0) {
                return false;
            }
            else {
                isMatch = true;
            }
        }
    }

    return isMatch;
}

module.exports = utils;