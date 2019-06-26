const request = require('request');

var getAuthTokenService = (callback) => {

  console.log('Device Auth token API hit');
  request({
    url: 'http://auth.exacttargetapis.com/v1/requestToken',
    body: {
      "clientId": "p0ss0ptpfmjcuosj0m70cvqt",
      "clientSecret": "toHsvwXF5BBeUggKk7ZjAG8r"
    },
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      "Content-Type": "application/json"
    },
    json: true
  }, (error, response, body) => {

    if (error) {
      callback('There was an error connecting to the server');
    }
    else if (response.statusCode == 400) {
      callback('Unable to get the token');
    }
    else if (response.statusCode == 200) {
      console.log('getDeviceAuthTokenService API hit:', response.statusCode)
      callback(undefined, {
        accessToken: body.accessToken
      });
    }
  });
};


var getDeviceTokenService = (token, deviceID, callback) => {
  console.log('getDeviceTokenService API hit');
  request({
    url: `http://www.exacttargetapis.com/contacts/v1/attributes/search `,
    body: {
      "request": {
        "attributes": [{
          "key": "MobilePush Demographics.System Token"
        }]
      },
      "conditionSet": {
        "operator": "And",
        "conditionSets": [],
        "conditions": [{
          "attribute": {
            "key": "MobilePush Demographics.Device ID"
          },
          "operator": "Equals",
          "value": {
            "items": [deviceID] //Device ID 
          }
        }]
      }
    },
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    timeout: 40000,
    rejectUnauthorized: false,
    json: true
  }, (error, response, body) => {

    if (error) {
      callback('There was an error connecting to the server');
    }
    else if (response.statusCode == 400) {
      callback('Unable to get the details');
    }
    else if (response.statusCode == 200) {
      console.log("Get device token API hit:", response.statusCode);
      callback(undefined, {
        device_token: body.items[0].values[0].value
      });
    }
  });
};


var sendPushNotificationService = (token, deviceToken, messageId, callback) => {

  console.log('sendPushNotificationService API hit');
  request({
    url: `http://www.exacttargetapis.com/push/v1/messageContact/${messageId}/send`,
    body:
    {
      "DeviceTokens": [deviceToken]
    },
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    rejectUnauthorized: false,
    json: true
  }, (error, response, body) => {

    if (error) {
      callback('There was an error connecting to the server');
    }
    else if (response.statusCode == 400) {
      callback('Unable to create the cart');
    }
    else if (response.statusCode == 202) {
      console.log('Send Push Notification API hit:', response.statusCode)
      callback('Notification Sent');
      //       callback(undefined, {
      //         basketId: body.basket_id
      //         });
    }
  });

};


function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

module.exports = {
  getAuthTokenService,
  getDeviceTokenService,
  sendPushNotificationService
};
