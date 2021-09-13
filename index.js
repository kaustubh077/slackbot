const Slackbot = require("slackbots");
const axios = require("axios");
var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')
var app = express()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const dotenv = require("dotenv");
const processImage = require("./convToS3URL");
// const processImage = require("./convToimgbbURL");
dotenv.config()
var app = express();

// Lets start our server
app.listen(process.env.PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Example app listening on port " + process.env.PORT);
});

// This route handles GET requests to our root ngrok address and responds with the same "Ngrok is working message" we used before
app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//BOT STARTING

const bot = new Slackbot({
    token: `${process.env.BOT_TOKEN}`,
    name: 'demobotapp'
})
//trial message " inspire me"
function handleMessage(message) {
    if(message.includes(' inspire me')) {
        // inspireMe()
        bot.postMessageToChannel(
            'test',
            `:zap: this works`,
        );
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//MENTIOINS HANDLING, CONVERTING PNG TO WEBP

// if the bot is mentioned with a png image
bot.on('message', (data) => {
	// console.log(data);
	if(data.type !== 'message') {
		return;
	}
	if(data.files){
		console.log("data files detected-",data.user)
		data.files.forEach(file => {
			if(file.filetype == "png"){
				const imgurl = file.url_private;
				const filename = file.name;
				processImage(imgurl, filename).then(urlf => {
					var message = {
						"blocks":[
							{
							"type": "section",
							"text": {
								"type": "mrkdwn",
								"text": `WebP URL for the image => ${urlf}`,
							}
						},
						]
					}
					sendMessageToSlackResponseURL(process.env.RESPONSE_URL,message);
				});				
			}
		})
	}
	handleMessage(data.text);
})


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SLASH COMMANDS HANDLING FOR DEEPLINKS


// Route the endpoint that our slash command will point to and send back a simple response

app.post('/command', urlencodedParser, (req, res) =>{
	res.status(200).end() // best practice to respond with empty 200 status code
	var reqBody = req.body
	console.log(req);
	var responseURL = reqBody.response_url
	if (reqBody.token != process.env.VERIFICATION_TOKEN){
	   	res.status(403).end("Access forbidden")
  	}else{
		// The message is test message from slack website just for testing.
	 	var message = {
			"blocks": [
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": "Hey there 👋 I'm TaskBot. I'm here to help you create and manage tasks in Slack.\nThere are two ways to quickly create tasks:"
					}
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": "*1️⃣ Use the `/task` command*. Type `/task` followed by a short description of your tasks and I'll ask for a due date (if applicable). Try it out by using the `/task` command in this channel."
					}
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": "*2️⃣ Use the _Create a Task_ action.* If you want to create a task from a message, select `Create a Task` in a message's context menu. Try it out by selecting the _Create a Task_ action for this message (shown below)."
					}
				},
				{
					"type": "image",
					"title": {
						"type": "plain_text",
						"text": "image1",
						"emoji": true
					},
					"image_url": "https://api.slack.com/img/blocks/bkb_template_images/onboardingComplex.jpg",
					"alt_text": "image1"
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": "➕ To start tracking your team's tasks, *add me to a channel* and I'll introduce myself. I'm usually added to a team or project channel. Type `/invite @TaskBot` from the channel or pick a channel on the right."
					},
					"accessory": {
						"type": "conversations_select",
						"placeholder": {
							"type": "plain_text",
							"text": "Select a channel...",
							"emoji": true
						}
					}
				},
			]
		}
  		sendMessageToSlackResponseURL(responseURL, message)
  	}
})

// this function handles button clicks, not necessary rightnow
app.post('/actions', urlencodedParser, (req, res) =>{
	res.status(200).end() // best practice to respond with 200 status
	var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
	var message = {
	    "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].name,
	    "replace_original": false
	}
	sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
})


function sendMessageToSlackResponseURL(responseURL, JSONmessage){
	var postOptions = {
		uri: responseURL,
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
			'Authorization': `Bearer ${process.env.BOT_TOKEN}`,
		},
		json: JSONmessage
  	}
  	request(postOptions, (error, response, body) => {
  		if (error){
  			console.log(error);
  		}
  	})
}
