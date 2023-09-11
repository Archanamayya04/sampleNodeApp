// Patch console.x methods in order to add timestamp information
// var logger = require("mylogger");

var {Logger} = require("./myLogger")
const path = require("path");

const logger = new Logger();

logger.setLevel('log');// either of 'log', 'debug', 'info', 'notice', 'warn', 'error'
//logger.setLogPath('/var/log/testLog.txt'); //optional, if not set it will pipe to stdout
//use either setLogPath or useRotate
logger.useRotate({
    // dir: "/var/log",
    dir: path.resolve(__dirname, "../../logs"),
    fileName: "suppression_mate",
    rotateType: "day", //minute/day/week/month/year
    dateFormat: "yyyymmddhhMM",// a valid date format. For more see https://www.npmjs.com/package/dateformat Date formate will prepend on filename
    useNewDir: true //if it is true there will be separate dir instead of appending on filename
});

module.exports = {logger}