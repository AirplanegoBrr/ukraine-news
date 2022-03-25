//This file is based off news.py
const fs = require('fs');
const news = require('./news');
const fetch = require('node-fetch');

const debug = false
const console = require('./console.js')

var newsJSON = {}
var title = null
var content = null
var imageUrl = null
var isBreaking = null
var post_locator = null
var updated = null

async function getJSONfile() {
    newsJSON = require('./data.json');
}

async function getData() {
    return new Promise(async (resolve, reject) => {
        await getJSONfile();
        var url = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-lx-commentary-data-paged%2FassetUri%2F%252Fnews%252Flive%252Fworld-europe-${newsJSON.news_url}%2FisUk%2Ffalse%2Flimit%2F20%2FnitroKey%2Flx-nitro%2FpageNumber%2F1%2FserviceName%2Fnews%2Fversion%2F1.5.6?timeout=5`;
        //console.log(url)
        console.debug("Fetching data from BBC")
        var response = await fetch(url);
        var data = await response.json();
        console.debug("Fetched data from BBC")

        try {
            var latest = data.payload[0].body.results[0]
            if (latest["assetId"] == newsJSON.assetId) {
                console.log("No new news")
                return resolve(null)
            }
            newsJSON.assetId = latest["assetId"];

            title = latest["title"];
            content = []
            imageUrl = ""
            isBreaking = latest["options"]["isBreakingNews"];
            post_locator = latest["locator"];
            updated = latest["lastUpdated"];

            console.debug("Parsing data")

            try {
                console.debug("Checking for image")
                for (imageKey in latest["media"]["images"]["body"]) {
                    imageUrl = latest["media"]["images"]["body"][imageKey]["href"]
                    console.debug("Found image")
                    break
                }
            } catch (e) {
                console.debug("No image")
            }

            console.debug(latest)
            for (item in latest["body"]) {
                item = latest["body"][item]

                if (item.name == "paragraph") {
                    console.debug("paragraph")

                    for (child in item.children) {
                        child = item.children[child]
                        console.debug("Child:")
                        console.debug(child)

                        if (child.name == "text") {
                            console.debug("Text:")
                            console.debug(child.text)
                            content.push(child.text)
                        } else if (child.name == "link") {
                            console.debug("link")
                            text = child.children[0].children[0].text;
                            text_url = child.children[2].attributes[1].value;
                            console.debug(text_url)
                            if (text_url.startsWith("https://www.bbc.com/news/live/world-europe-") || text_url.startsWith("https://www.bbc.com/news/world-europe-")) {
                                newsJSON.news_url = text_url.split("-")[2];
                                console.log(`Changing news url to ${newsJSON.news_url}`);
                                break
                            }
                            content.push(`[${text}](${text_url})`);
                        } else if (child.name == "bold") {
                            console.debug("bold")
                            content.push("**" + child.children[0].text.trim() + "**");
                        }
                    }
                    content.push("\n\n")
                } else if (item.name == "list") {

                    for (child in item.children) {
                        child = item.children[child]
                        content.push(" . ")
                        for (subChild in child.children) {
                            subChild = child.children[subChild]
                            if (subChild.name == "text") {
                                content.push(subChild.text.trim() + " ")
                            } else if (subChild.name == "link") {
                                text = subChild.children[0].children[0].text;
                                text_url = subChild.children[2].attributes[1].value;
                                if (text_url.startsWith("https://www.bbc.co.uk/news/live/world-europe-") || text_url.startsWith("https://www.bbc.co.uk/news/world-europe-")) {
                                    newsJSON.news_url = text_url.split("-")[5];
                                    console.log(`Changing news url to ${newsJSON.news_url}`);
                                    break
                                }
                                content.push(`[${text}](${text_url})`)

                            } else if (subChild.name == "bold") {
                                content.push("**" + subChild.children[0].text.trim() + "**")
                            }
                        }

                    }
                    content.push("\n\n")
                } else if (item.name == "link") {
                    text = item.children[0].children[0].text;
                    text_url = item.children[2].attributes[1].value;
                    if (text_url.startsWith("https://www.bbc.co.uk/news/live/world-europe-") || text_url.startsWith("https://www.bbc.co.uk/news/world-europe-")) {
                        newsJSON.news_url = text_url.split("-")[5];
                        console.log(`Changing news url to ${newsJSON.news_url}`);
                        break
                    }
                    content.push(`[${text}](${text_url})`)
                } else if (item.name == "video") {
                    content.push("*There is a video, but the bot cannot display it. Please click on the link above to view it.*\n\n")
                } else if (item.name == "quote") {
                    if (item.children[0].name == "quoteText") {
                        content.push("\"" + item.children[0].children[0].text.replace("\"", "") + "\"\n\n")
                    }
                } else if (item.name == "embed") {
                    try {
                        if (item.children[0].children[0].text == "twitter") {
                            tUrl = item.children[1].children[0].text
                            content.push(`[Twitter](${tUrl})\n\n`)
                        }
                    } catch (e) {
                        console.debug("No twitter embed")
                    }
                }
            }

            console.log(`New news: ${title}`);
            //convert the Array to a string
            content.forEach(function (item, index, array) {
                array[index].trim()
            });
            content = content.join(" ");
            console.news(content);
            console.news(`${imageUrl}`);
            console.news(`${isBreaking}`);
            console.news(`https://www.bbc.co.uk/news/live/world-europe-${newsJSON.news_url}?pinned_post_locator=${post_locator}`);
            console.news(`${updated}`);

            //This is for saving news to file
            if (newsJSON.fileSaving) {
                //MD file
                try {
                    var dateTime = updated.split("T");
                    var DMY = dateTime[0].split("-");
                    var fileName = `${DMY[2]}-${DMY[1]}-${DMY[0]}.md`;
                    if (!fs.existsSync("./news/")) {
                        fs.mkdirSync("./news/");
                    }
                    //check if fileName exists if not create it
                    if (!fs.existsSync("./news/" + fileName)) {
                        fs.writeFileSync("./news/" + fileName, `# News for ${DMY[2]}-${DMY[1]}-${DMY[0]}\n\n`);
                    }
                    //check if the file already has the news
                    var file = fs.readFileSync("./news/" + fileName, "utf8");
                    if (file.includes(title)) {
                        console.log("News already exists")
                    } else {
                        var toAppent = `## Title: ${title}\n\n${content.trim()}\n${imageUrl}\n\nIs breaking: ${isBreaking}\n\nDate: ${updated}\n\nLink: https://www.bbc.co.uk/news/live/world-europe-${newsJSON.news_url}?pinned_post_locator=${post_locator}\n\n![Image](${imageUrl})\n\n\n\n`;
                        fs.appendFileSync("./news/" + fileName, toAppent);
                        console.log("./news/" + fileName)
                    }
                } catch (e) {
                    console.log("Error trying to save news file")
                    console.log(e)
                }

                //JSON
                try {
                    var dateTime = updated.split("T");
                    var DMY = dateTime[0].split("-");
                    var fileName = `${DMY[2]}-${DMY[1]}-${DMY[0]}.json`;
                    //check for newsJSON dir
                    if (!fs.existsSync("./newsJSON/")) {
                        fs.mkdirSync("./newsJSON/");
                    }
                    //check if fileName exists if not create it
                    if (!fs.existsSync("./newsJSON/" + fileName)) {
                        fs.writeFileSync("./newsJSON/" + fileName, `{}`);
                    }
                    //check if the file already has the news
                    var file = fs.readFileSync("./newsJSON/" + fileName, "utf8");
                    if (file.includes(title)) {
                        console.log("NewsJSON already exists")
                    } else {
                        var jsonTempLoading = require("./newsJSON/" + fileName);
                        var jsonNewsTemp = {
                            title: title,
                            content: content,
                            imageUrl: imageUrl,
                            isBreaking: isBreaking,
                            url: `https://www.bbc.co.uk/news/live/world-europe-${newsJSON.news_url}?pinned_post_locator=${post_locator}`,
                            updated: updated
                        }
                        jsonTempLoading[`${DMY[2]}-${DMY[1]}-${DMY[0]}`] = jsonNewsTemp;
                        console.debug(jsonTempLoading)
                        console.debug(jsonNewsTemp)
                        fs.writeFileSync("./newsJSON/" + fileName, JSON.stringify(jsonTempLoading));
                        console.log("./newsJSON/" + fileName)
                    }
                } catch (e) {
                    console.log("Error trying to save news file")
                    console.log(e)
                }
            }

            //save newsJSON to file
            fs.writeFileSync("./data.json", JSON.stringify(newsJSON));
            console.log("Saved newsJSON to file")

            var jsonBack = {
                "title": title,
                "content": content,
                "imageUrl": imageUrl,
                "isBreaking": isBreaking,
                "post_locator": post_locator,
                "updated": updated,
                "news_url": `https://www.bbc.co.uk/news/live/world-europe-${newsJSON.news_url}?pinned_post_locator=${post_locator}`
            }

            //console.log(jsonBack);
            return resolve(jsonBack)
        } catch (e) {
            console.log(e)

            //99% of the time when we get an error it is the proxy error. A simple fix is to change the news ID
            newsJSON.news_url = 60856533
            fs.writeFileSync("./data.json", JSON.stringify(newsJSON));

            console.error(e)
            return reject(e)
        }
    });
}

module.exports = {
    getData
}