const url = "https://codeload.github.com/ukraine-war-info/ukraine-news/zip/refs/heads/main"
const fs = require('fs');
const gitDownload = require('download-git-repo');

const blackList = ["node_modules", "news", "newsJSON", "package-lock.json", "package.json", "README.md", "notes.txt", ".git", ".gitignore", "temp", "updater.js"];

//make temp dir if it doesn't exist
if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp');
}

gitDownload(`direct:${url}`, __dirname + '/temp', (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Downloaded! Checking for updates...");
    const data1 = require('./data.json');
    const data2 = require('./temp/data.json');
    if (data2.version != data1.version) {
        console.log("New version available! Updating...");
        const files2 = fs.readdirSync('./temp');
        files2.forEach(file => {
            fs.copyFileSync('./temp/' + file, file);
            console.log("Copied: " + file);
        });
    } else {
        console.log("No updates available! Removing temp files...");
        //delete temp files
        const files = fs.readdirSync('./temp');
        files.forEach(file => {
            fs.unlinkSync('./temp/' + file);
            console.log("Deleted: " + file);
        });
    }
});

console.log("Done!");