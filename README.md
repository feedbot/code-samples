# FeedBot Installation

FeedBot is all about analyzing requests that are made to your bots and allowing users to provide their own feedback based on the responses that they receive.  For that reason, we need to know the details of those requests, and we also need to provide your users with custom links where they can provide feedback.  Setting your bot up to use FeedBot is simple:

## Step 1: Create An Account

Head over to the [FeedBot Dashboard](http://api.getfeedbot.com/dashboard/) and register for an account.  Then click "Add a bot" in the left panel and give the bot a name.  This will provide you with the API Key and Secret Key that you'll need next.

## Step 2: Send Your Requests

Now that you have your API Key and Secret Key, you're ready to connect your bot to FeedBot.  All you need to do is send a request to our API endpoint:

##### API Endpoint
```
POST http://api.getfeedbot.com/api/index.php
```

##### Request Parameters
```
{
	action		: 'getLinks',
	apiKey		: <Your FeedBot API Key>,
	secretKey	: <Your FeedBot Secret Key>,
	botRequest	: <Stringified JSON Received From Slack>
}
```

## Step 3: Inject FeedBot Links Into Slack Response

FeedBot will return `errorCode`, `errorMessage`, and `data`.

```
{
	data: {
		helpfulLink: "http://api.getfeedbot.com/submit/#d22a364cc800d233d950bebabdcf4a90",
		notHelpfulLink:"http://api.getfeedbot.com/submit/#c69f4475234c2ad524a996de1bfe3d1d"
	},
	errorCode:"0",
	errorMessage:"Success"
}
```

The links provided should be included as attachments in the repsonse that your bot sends to Slack.

```
attachments.push({
	"text": "Was this message helpful?  <"+data.helpfulLink+"|:thumbsup:>    <"+data.notHelpfulLink+"|:thumbsdown:>\nPowered By FeedBot"
});
```

## That's It!

Users will now see the option to provide feedback when they ask your bot for information.  You can monitor their feedback by logging back into the [FeedBot Dashboard](http://api.getfeedbot.com/dashboard/).

#Demos

## Node.js

Take a look at the node-js directory to see a fully functional demo, but here's the good part.  This is a simple express server that reaches out to the FeedBot API endpoint and injects the resulting links into the Slack response.

```javascript
//express
var express = require('express');
var app = express();

//add post support
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//needle
var needle = require('needle');

//handle requests
function handleRoot(req, res) {
	
	//send a request to FeedBot in order to get your custom links
	needle.post('http://api.getfeedbot.com/api/index.php', {
			action		: 'getLinks',
			apiKey		: <Your FeedBot API Key>,
			secretKey	: <Your FeedBot Secret Key>,
			botRequest	: JSON.stringify(req.body)
		},
		function (feedbotError, feedbotResponse) {
			
			//add any attachments that your bot should respond with (as you normally would)
			var attachments = [{
				"text": "Hello World!"
			}];

			//attempt to add the FeedBot attachment, but degrade gracefully of course
			if (!feedbotError) {
				try { attachments.push({ "text": "Was this message helpful?  <"+JSON.parse(feedbotResponse.body).data.helpfulLink+"|:thumbsup:>    <"+JSON.parse(feedbotResponse.body).data.notHelpfulLink+"|:thumbsdown:>\nPowered By FeedBot" }); }
				catch (err) { attachments.push({ "text": JSON.stringify(feedbotResponse.body) }); }
			}

			//send your response back to Slack
			res.type('application/json').status(200).json({
				"response_type": "ephemeral",
			    "attachments": attachments
			});
		}
	);
}
app.get('/', handleRoot);
app.post('/', handleRoot);

//start server
app.listen(process.env.PORT || 3000, function () {
	console.log('Example app listening on port 3000!');
});
```