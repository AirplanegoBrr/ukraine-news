const chalk = require('chalk');
const data = require('./data.json');

function log(text, __args) {
    //logging
    //get time
    if (!data.consoleLog) return;
    let date = new Date();
    let time = date.getHours() + ":" + date.getMinutes()

    console.log(`[${time}][Logging]:`,chalk.green(text));
}

function debug(text, __args) {
    //debugging
    if (!data.consoleLog) return;
    if (data.debug){
        let date = new Date();
        let time = date.getHours() + ":" + date.getMinutes()
        console.log(`[${time}][Debugging]:`,chalk.blue(text));
    }
}

function warn(text, __args) {
    //warning
    if (!data.consoleLog) return;
    let date = new Date();
    let time = date.getHours() + ":" + date.getMinutes()
    console.log(`[${time}][Warning]:`, chalk.yellow(text));
}

function error(text, __args) {
    //error
    if (!data.consoleLog) return;
    let date = new Date();
    let time = date.getHours() + ":" + date.getMinutes()
    console.log(`[${time}][Error]:`,chalk.red(text));
}

function news(text, __args) {
    //news
    if (!data.consoleLog) return;
    let date = new Date();
    let time = date.getHours() + ":" + date.getMinutes()
    console.log(`[${time}][News]:`,chalk.magentaBright(text));
}

function blankSpace(){
    if (!data.consoleLog) return;
    console.log("")
}



module.exports = {
    log,
    debug,
    warn,
    error,
    news,
    blankSpace
}