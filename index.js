const fs = require('fs');
const news = require('./news.js');

for (var i = 0; i < 20; i++) {
    console.log("")
}

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
console.log("")

//make news directory
fs.mkdir('./news', { recursive: true }, (err) => {
    if (err) throw err;
});

//every minute, check if news.json exists

function run() {
    try {
        news.getData();
    } catch (err) {
        console.log(chalk.red(err));
    }
}

run();
setInterval(() => {
    run();
}, 60000);