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