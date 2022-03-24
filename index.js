const fs = require('fs');
const news = require('./news.js');

//make news directory
fs.mkdir('./news', { recursive: true }, (err) => {
    if (err) throw err;
});

//every minute, check if news.json exists

news.getData();
setInterval(() => {
    news.getData();
}, 60000);