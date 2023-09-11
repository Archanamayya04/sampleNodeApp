'use-strict';
var fs = require('fs');
var util = require('util');
var dateFormat = require('dateformat');
var levels = ['log', 'debug', 'info', 'notice', 'warn', 'error'];
var rotateTypes = ['minute', 'hour', 'day', 'month', 'year'];//minute is for testing purpose
var Logger = function () {
    this.loglevel = 0;
    this.excludes = [];
    this.fPath = null;
    for (var key in levels) {
        this.createFunction(key);
    }
};
Logger.prototype.useRotate = function (option) {
    if (typeof option.dir === 'undefined') {
        throw new Error('Dir required');
    }
    if (typeof option.fileName === 'undefined') {
        throw new Error('File Name required');
    }
    if (typeof option.rotateType === 'undefined') {
        throw new Error('Rotate Type required');
    }
    if (rotateTypes.indexOf(option.rotateType) < 0) {
        throw new Error('Invalid Rotate Type. Use on of ' + rotateTypes.join(','));
    }
    this.option = option;
    this.updateLogpath(this.getNextRunDiff());
};
Logger.prototype.getNextRunDiff = function () {
    var today = new Date();
    var nextDate = new Date();
    switch (this.option.rotateType) {
        case 'minute':
            this.formatStr = this.dateFormat || "yyyymmddhhMM";
            nextDate.setMinutes(today.getMinutes() + 1, 0, 0);
            break;
        case 'hour':
            this.formatStr = this.dateFormat || "yyyymmddhh";
            nextDate.setHours(today.getHours() + 1, 0, 0, 0);
            break;
        case 'day':
            this.formatStr = this.dateFormat || "yyyymmdd";
            nextDate.setDate(today.getDate() + 1);
            nextDate.setHours(0, 0, 0, 0);
            break
        case 'month':
            nextDate.setMonth(today.getMonth() + 1, 0);
            nextDate.setHours(0, 0, 0, 0);
            this.formatStr = this.dateFormat || "yyyymm";
            break;
        case 'year':
            nextDate.setFullYear(today.getFullYear() + 1, 0, 0);
            nextDate.setHours(0, 0, 0, 0);
            this.formatStr = this.dateFormat || "yyyy";
            break;
    }
    return nextDate.getTime() - today.getTime();
};
Logger.prototype.getLogPath = function () {
    if (typeof this.option.useNewDir === 'undefined' || this.option.useNewDir !== true) {
        return this.option.dir + "/" + this.option.fileName + "_" + dateFormat(this.formatStr) + ".log";
    }
    var newDir = this.option.dir + "/" + dateFormat(this.formatStr);
    try {
        fs.mkdirSync(newDir, { recursive: true });
    } catch (e) {

    }
    return newDir + "/" + this.option.fileName + ".log";
};
Logger.prototype.updateLogpath = function (nextChange) {
    var self = this;
    var oldWs = this.fileWs;
    this.setLogPath(this.getLogPath());
    if (oldWs) {
        try {
            fs.close(oldWs, function (err) { });
        } catch (e) {

        }
    }
    setTimeout(function () {
        self.updateLogpath(self.getNextRunDiff());
    }, nextChange);
}
Logger.prototype.writeLog = function (arr) {
    console.log.apply(console, arr);
    if (this.fPath === null) {
        console.log.apply(console, arr);
    } else {
        this.fileWs.write(arr.map(function (elm) {
            if (typeof (elm) !== 'object') {
                return elm;
            }
            return util.inspect(elm);
        }).join(' ') + '\r\n');
    }
}
Logger.prototype.createFunction = function (key) {
    var self = this;
    this[levels[key]] = function (str) {
        if (self.excludes.indexOf(levels[key]) === -1) {
            var ar = Array.prototype.slice.call(arguments);
            var l = levels[key].toUpperCase();
            var strDate = self.formatDate(new Date);
            ar.unshift("[" + l + "]");
            ar.unshift(strDate);
            self.writeLog(ar);
        }
    }
}
Logger.prototype.setLevel = function (level) {
    if (typeof level === "string") {
        for (var i = levels.indexOf(level) - 1; i >= 0; i--) {
            this.excludes.push(levels[i]);
        }
    }
};
Logger.prototype.setLogPath = function (fPath) {
    this.fPath = fPath;
    this.fileWs = fs.createWriteStream(fPath, { flags: 'a' });
}
Logger.prototype.formatDate = function (d) {
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    return d.getFullYear() + '-' +
        pad(d.getMonth() + 1) + '-' +
        pad(d.getDate()) + ' ' +
        pad(d.getHours()) + ':' +
        pad(d.getMinutes()) + ':' +
        pad(d.getSeconds());
};

module.exports = {Logger}