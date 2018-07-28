'use strict';

const apiai = require('apiai');
const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const qsr = require('./qsr-apis');
const app = express();
const user_location = require('./user-location');

if (!config.API_AI_CLIENT_ACCESS_TOKEN) {
	throw new Error('missing API_AI_CLIENT_ACCESS_TOKEN');
}
if (!config.SERVER_URL) { //used for ink to static files
	throw new Error('missing SERVER_URL');
}



app.set('port', (process.env.PORT || 5000))

//serve static files in the public directory
app.use(express.static('public'));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}))

// Process application/json
app.use(bodyParser.json())




const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: "en",
});

const sessionIds = new Map();

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})

app.post('/webhook/', function (req, res) {
	var data = req.body;
	var sessionId = req.body.sessionId;
	console.log(JSON.stringify(data));
	var actionName = req.body.result.action;
 	var parameters = req.body.result.parameters;
 	var message = req.body.result.resolvedQuery;
 	var messageData= '' ;
	var displayText = '';
	var text = '';

       switch (actionName) {

				 case 'request_permission': {
		 					console.log('In request_permission');

		 					if(isDefined(actionName)){

									user_location.userLocation(req, res);
									console.log(messageData);
		 							//res.sendStatus(200);
		 							}
		 				}
		 					break;

		case 'pincode.request': {
					console.log('In action pincode');
					var displayText = '';
					if(isDefined(actionName) && parameters !== ''){
						var text = '';
						var pincode = parameters.any;
						app1.requestCoordinate(pincode,(error, results) => {
							if(error){
								text = 'Error fetching the data';
							}else {
								text = `Latitude: ${results.latitude}  Longitude: ${results.longitude}`;
								messageData = {
										speech: text,
										displayText: text
										}

							}
							console.log(messageData);
							//res.sendStatus(200);
							res.send(messageData);
						});
					}
				}
					break;

		default:
			//unhandled action, just send back the text
			sendTextMessage(senderId, responseText);
	}
		// Assume all went well.
		// You must send back a 200, within 20 seconds

});


function isDefined(obj) {
	if (typeof obj == 'undefined') {
		return false;
	}

	if (!obj) {
		return false;
	}

	return obj != null;
}

// Spin up the server
app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'))
})
