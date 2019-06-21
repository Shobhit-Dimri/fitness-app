'use strict';

const apiai = require('apiai');
const config = require('./config');
const express = require('express');
const xml2js = require('xml2js');
const bodyParser = require('body-parser');
const sfcc = require('./sfcc-apis.js');
const sfmc = require('./sfmc.js');
const mailer = require('./mailer.js');
const nodemailer = require('nodemailer');
const jwtdecode = require('jwt-decode');
const { dialogflow, Permission } = require('actions-on-google');
const aiapp = dialogflow();
const app = express();
var recommendedName;
var token = '';
var text = '';
var cardId;
var basketId;
var payment_id;
var customer_id;
var emailId;
var orderTotal;
var customerName;
var custLastName;
var customer_address_id;
var orderCode;
var messageData = '';
var messageId;
var deviceAccessToken;
var deviceIdJ = "0B7D939DB169CF65545F29D36EBD1128E23D654B913D42057D5757A4FB755E29";
var deviceIdG = "8AD82A24FE971D3FF2E94D3BF85747E2A4DC778425045E159F88DBD71E7B27C3";  //"FDEE03619CD12091CFE6994EBFF32FB73506283F41D3F330D2AAD8896899F5A7";
var deviceIdP = "79523913A0749F3ABDB658FE9254111BCF96067DAD37E232F0CF72E27832A833";
var deviceIdS = "";
var email; //= 'mickeyd.mcd321@gmail.com';
var password; //= 'mickeyd.mcd321@gmail.com';
debugger;


if (!config.API_AI_CLIENT_ACCESS_TOKEN) {
	throw new Error('missing API_AI_CLIENT_ACCESS_TOKEN');
}
if (!config.SERVER_URL) { //used for ink to static files
	throw new Error('missing SERVER_URL');
}


app.set('port', (process.env.PORT || 4988))

//serve static files in the public directory
app.use(express.static('public'));

// Process application/json
app.use(bodyParser.json());

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: "en",
});

const sessionIds = new Map();

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})

function pushNotification(deviceID, messageId) {
	sfmc.getDeviceTokenService(deviceAccessToken, deviceID, (error, result) => {
		if (error) {
			console.log(error);
		} else {
			console.log("Device token :" + result.device_token);
			sfmc.sendPushNotificationService(deviceAccessToken, result.device_token, messageId, (error, finalResult) => {
				if (error) {
					console.log(error);
				} else {
					console.log(finalResult);
				}
			});
		}
	});
};


function notify(emailId, messageId) {

	console.log("In notify-  " + emailId);
	if (emailId == 'gwengraman12@gmail.com') {
		console.log("Gwen User");
		setTimeout(() => pushNotification(deviceIdG, messageId), 3000);

	} else if (emailId == 'josselain12@gmail.com') {
		console.log("Josselain User");
		setTimeout(() => pushNotification(deviceIdJ, messageId), 3000);

	} else if (emailId == 'pratikb365@gmail.com') {
		console.log("Pratik User");
		setTimeout(() => pushNotification(deviceIdP, messageId), 3000);

	} else if (emailId == 'dimrishobhit@gmail.com') {
		console.log("Shobhit User");
		setTimeout(() => pushNotification(deviceIdS, messageId), 3000);

	} else {
		console.log("Different User");
	}
};

//mailer.sendMailService("pratikb365@gmail.com", "Pratik");

app.post('/webhook/', (req, res) => {

	//console.log(access_token);
	// 	function sendMessage(text) {
	// 		messageData = {
	// 				speech: text,
	// 				displayText: text
	// 				}
	// 		res.send(messageData);	
	// 	};

	//console.log(JSON.stringify(req.body));
	var data = req.body;
	var sessionId = req.body.sessionId;
	var actionName = req.body.result.action;
	var parameters = req.body.result.parameters;
	var message = req.body.result.resolvedQuery;
	switch (actionName) {

		case 'check_sign_in': {
			console.log('In check_sign_in');
			if (isDefined(actionName)) {
				messageData = {
					"data": {
						"google": {
							"expectUserResponse": true,
							"systemIntent": {
								"intent": "actions.intent.SIGN_IN",
								"data": {}
							}
						}
					}
				}
				res.send(messageData);
			}
		}
			break;

		case 'shoes-in-stock': {
			console.log("In shoes-in-stock");
			if (isDefined(actionName)) {
				var idtoken = req.body.originalRequest.data.user.idToken;
				var decoded = jwtdecode(idtoken);
				//console.log(decoded);
				if (decoded.iss == 'https://accounts.google.com') {
					email = decoded.email;
					password = decoded.email;
					console.log(email + '   ' + password)
				}
				var passwordTest = password.charAt(0).toUpperCase() + password.slice(1);
				// console.log(passwordTest);
				// passwordTest = (email === "dimrishobhit@gmail.com")?passwordTest+23:passwordTest;
				if(email === "dimrishobhit@gmail.com"){
					let emailArray = passwordTest.split("@");
					passwordTest = emailArray[0]+23+"@"+emailArray[1];
				}
				console.log(passwordTest);
				sfcc.getAuthTokenService(email, passwordTest, (error, result) => {
					if (error) {
						console.log("Error came :");
						console.log(error);
					} else {
						customer_id = result.customer_id
						token = result.token
						emailId = result.email
						customerName = result.first_name
						custLastName = result.last_name
						sfcc.createCartService(result.token, (error, cartResult) => {
							if (error) {
								console.log(error);
							} else {
								basketId = cartResult.basketId;
								//console.log(result.token+' '+result.customer_id+" "+result.email);
								text = "Yes, there is currently a promotion - they are at 200 swiss francs until the end of the month and are available at your usual Cap Sports Style store. Same color as current one";
								messageData = {
									speech: text,
									displayText: text
								}
								res.send(messageData);
							}
						});
					}
				});
			}
		}
			break;


		// 		case 'serviceCloud': {
		// 					console.log('In serviceCloud');
		// 						if(isDefined(actionName)){
		// 							text: "Sure, I'll inform the store manager. Your shoes will be ready on time. Probably don't use them for your next trail as the distance is too long for brand new shoes. By the way do you want to check how you used your last pair ?";
		// 							messageData = {
		// 									speech: text,
		// 									displayText: text
		// 									}
		// 							res.send(messageData);	
		// 							mailer.sendMailService(emailId, customerName);
		// 						     }
		// 						}
		// 					break;


		case 'shoes-in-stock-order': {
			console.log('In shoes-in-stock-order');
			console.log(basketId + "  " + token);
			mailer.sendMailService(emailId, customerName, custLastName);
			if (isDefined(actionName)) {
				var productName = req.body.result.contexts[0].parameters.sportsProducts
				if (productName == 'Gloves') {
					var product_id = '0001TG250001';
					messageId = 'MTY0OjExNDow';
					sfcc.addProductsToCart(token, product_id, basketId, (error, result) => {
						if (error) {
							console.log(error);
						} else {
							console.log(result.responseCode);
							notify(emailId, messageId);
							//setTimeout(() => pushNotification(deviceIdJ), 3000);
							text = "I am sending you the options, please check on your app.";
							messageData = {
								speech: text,
								displayText: text
							}
							res.send(messageData);
						}
					});

					sfmc.getAuthTokenService((error, result) => {
						if (error) {
							console.log(error);
						} else {
							deviceAccessToken = result.accessToken;
							console.log(result.accessToken);
						}
					});
				} else if (productName == 'Jackets') {
					var product_id = '883360541099';
					messageId = 'MTgwOjExNDow';
					sfcc.addProductsToCart(token, product_id, basketId, (error, result) => {
						if (error) {
							console.log(error);
						} else {
							console.log(result.responseCode);
							notify(emailId, messageId);
							//setTimeout(() => pushNotification(), 3000);
							text = "I am sending you the options, please check on your app.";
							messageData = {
								speech: text,
								displayText: text
							}
							res.send(messageData);
						}
					});

					sfmc.getAuthTokenService((error, result) => {
						if (error) {
							console.log(error);
						} else {
							deviceAccessToken = result.accessToken;
							console.log(result.accessToken);
						}
					});
				}
				//mailer.sendMailService(emailId, customerName);
			}
		}
			break;

		case 'check_color': {
			console.log("In check_color");
			if (isDefined(actionName)) {
				sfcc.getAddressService(token, customer_id, (error, addressResult) => {
					if (error) {
						console.log(error);
					} else {
						customer_address_id = addressResult.customer_address_id;
						sfcc.setShipmentService(token, customer_address_id, basketId, (error, result) => {
							if (error) {
								console.log(error);
							} else {
								console.log(result.responseCode);
								text = "I think this color is the best one to fit with your shoes and pant. You will look awesome with them.";
								messageData = {
									speech: text,
									displayText: text
								}
								res.send(messageData);
							}
						});

					}
				});
			}
		}
			break;

		case 'color-confirmed': {
			console.log("In color-confirmed");
			if (isDefined(actionName)) {
				sfcc.setShipmentIdService(token, basketId, (error, result) => {
					if (error) {
						console.log(error);
					} else {
						orderTotal = result.product_total;
						text = "I assume I need express delivery so you have it for your race. Do you need something else?";
						messageData = {
							speech: text,
							displayText: text
						}
						res.send(messageData);
					}
				});
			}
		}
			break;


		case 'process-order': {
			console.log("In process-order");
			if (isDefined(actionName)) {
				sfcc.addPaymentService(token, basketId, customerName, orderTotal, (error, result) => {
					if (error) {
						console.log(error);
					} else {
						console.log(result.responseCode);
						text = "Can I use your saved card or Google pay ?";
						messageData = {
							speech: text,
							displayText: text
						}
						res.send(messageData);
					}
				});
			}
		}
			break;


		case 'orderConfirmed': {
			console.log("In orderConfirmed");
			if (isDefined(actionName)) {
				function myFunc(token, payment_id, order_no) {
					//console.log(`In updating payment method ${token} ${payment_id} ${order_no}`);
					sfcc.updatePaymentService(token, order_no, payment_id, orderTotal, (error, result) => {
						if (error) {
							console.log(error);
						} else {
							console.log(result);
						}
					});
				};
				sfcc.placeOrderService(token, basketId, (error, result) => {
					if (error) {
						console.log(error);
					} else {
						payment_id = result.payment_id;
						orderCode = result.code;
						//console.log(result.code+"  "+result.payment_id);
						text = "Your order has been confirmed. They will be delivered to your home address before Saturday. Your store manager will wait for you on Friday to pick up your shoes.";
						messageData = {
							speech: text,
							displayText: text
						}
						res.send(messageData);
						setTimeout(() => myFunc(token, result.payment_id, result.code), 3000);
					}
				});
			}
		}
			break;

		default:
			//unhandled action, just send back the text
			break;
	}
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
