const request = require('request')
const cheerio = require('cheerio')
const colors = require('colors')
const fs = require('fs')
const prompt = require("prompt-sync")({ sigint: true });


// Input the letter of your name 👇

const letter  = prompt("What is the first letter of your name?");
// let letter = 'P'  // As my name is Piyush Aryan 
const url = `https://en.wikipedia.org/wiki/${letter[0]?.toUpperCase() || 'P'}`
console.log(url.magenta)

// Function to get data from wiki's server 
const getData = async () => {

    // Callback function to handle request 
    const callback = async (error, response, html) => {
        if (error) {
            console.log(error)
            return
        }
        else {
            console.log('Status Code:'.yellow,response.statusCode)
            let topics = await FindTopicsFromToc(html)
            let getContent = await getContentFromBodyContent(html, topics)


            const object = {
                topics: [topics[0], topics[1], topics[2]],
                content: getContent
            }

            // Write the gathered data into a file 
            fs.writeFileSync("Wiki-Scrapper.json", JSON.stringify(object))
        }
    }
    await request(url, callback)

}
getData()


// Cheerio's Magic Here 

// Find Out all the topics from table of Content 
const FindTopicsFromToc = async (html) => {
    let selecterTool = cheerio.load(html)
    let Level1TOCs = selecterTool('.toclevel-1>a>span')
    let topics = []
    console.log('\nTopics are :'.yellow)
    for (i = 1; i < 6; i = i + 2) {
        console.log(selecterTool(Level1TOCs[i]).text().white)
        topics.push(selecterTool(Level1TOCs[i]).text().split(' ').join('_'))
    }
    console.log('\n \nThe rest of the content is saved in Wiki-Scrapper.json ✔️ '.green)
    return topics
}

// Gets the content from the para tags
const getContentFromBodyContent = async (html, topics) => {
    let selectorTool = cheerio.load(html)
    let content = selectorTool('#content p  , #content h2').nextUntil(`#${topics[4]}`, 'p ,h2')
    return content.text()
}

