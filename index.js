const fs = require('fs');
//const chalk = require('chalk');
const news = require('./news.js');
const data = require('./data.json');
const console = require('./console.js');

console.log("###############################################################################")
console.log("#                                                                             #")
console.log("#                            Ukranie News Bot                                 #")
console.log("#                                                                             #")
console.log("#                          Made by AirplaneGobrr                              #")
console.log("#                                                                             #")
console.log("#                          Inspired by: DevFlock (Flock)                      #")
console.log("#                 https://github.com/DevFlock/ukraine-news-bot                #")
console.log("#                                                                             #")
console.log("###############################################################################")
console.log("Started")
console.log("Version: " + data.version)
console.blankSpace()

//dont touch
const devMode = false

//make news directory
fs.mkdir('./news', { recursive: true }, (err) => {
    if (err) throw err;
});

//every minute, check if news.json exists

async function run() {
    console.log("Grabbing news")
    try {
        a = await news.getData()
        if (a) {
            //console.log(a)
            if (devMode) require('./infoUpdater.js')
        } else {
            console.log("No news!")
        }
    } catch (e) {
        console.log(e)
    }

    console.blankSpace()
}

run();
setInterval(() => {
    run();
}, 15 * 1000);