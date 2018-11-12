const request= require('request');
var base64 = require('base-64');
var utf8 = require('utf8');

var getAuthTokenService = (username, password, callback) =>{

  console.log('Auth token API hit');
  // var bytes = utf8.encode(username+":"+password);
  // var bearer = base64.encode(bytes);
  var bearer= "Basic " +new Buffer(username + ':' + password).toString('Base64');
  request({
    url: 'https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/customers/auth?client_id=e4bd2b6d-1567-475d-9eb2-b2c86a37a560' ,
    body: {
    "type": "credentials"
    },
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
        "Authorization": bearer,
        "Content-Type": "application/json"
      },
    json: true
  }, (error, response, body) => {

    if(error){
      callback('There was an error connecting to the server');
    }
    else if(response.statusCode == 400){
      callback('Unable to get the token');
    }
    else if(response.statusCode == 200){
      console.log('getAuthTokenService API hit:', response.statusCode)
      var value=response.headers['authorization'];
      callback(undefined, {
        token: value.substr(7,value.length),
        customer_id: body.customer_id,
        email: body.email
        });
      }
  });
};


var getProductDetailsService = (productName, callback) => {

        console.log('Getting product details API hit');
        request({
          url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/product_search?q=${productName}&client_id=e4bd2b6d-1567-475d-9eb2-b2c86a37a560`,
          method: 'GET',
          headers: {
           "content-type": "application/json"
                  },
          timeout: 40000,
          rejectUnauthorized: false,
          json: true
          }, (error, response, body) => {

          if(error){
            callback('There was an error connecting to the server');
          }
          else if(response.statusCode == 400){
            callback('Unable to get the details');
          }
          else if(response.statusCode == 200){
            console.log("Product by name API hit:", response.statusCode);
            callback(undefined, {
              productId: body.hits[0].product_id
              });
           }
       });
};


var createCartService = (authToken, callback) => {

  console.log('Create cart API hit');
  request({
    url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/baskets`,
    method: 'POST',
    headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${authToken}`
      },
    rejectUnauthorized: false,
    json: true
  }, (error, response, body) => {

    if(error){
      callback('There was an error connecting to the server');
    }
    else if(response.statusCode == 400){
      callback('Unable to create the cart');
    }
    else if(response.statusCode == 200){
      console.log('createCartService API hit:', response.statusCode)
      callback(undefined, {
        basketId: body.basket_id
        });
      }
    });

};

var addProductsToCart = (authToken, product_id, basket_id, callback) => {

  console.log('Add products API entered');
  var qty = 1;
  request({
    url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/baskets/${basket_id}/items`,
    body: {
        "product_id" : product_id,
        "quantity": qty
      },
    timeout: 40000,
    method: 'POST',
    headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${authToken}`
      },
    rejectUnauthorized: false,
    json: true
  }, (error, response, body) => {

    if(error){
      callback('There was an error connecting to the server');
    }
    else if(response.statusCode == 401){
     callback('Unable to add products');
    }
    else if(response.statusCode == 200){
      console.log('Add products API hit:', response.statusCode);
      }
  });

};


var getAddressService = (authToken, customer_id, callback) => {
  console.log('Get address API hit');
  request({
    url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/customers/${customer_id}/addresses`,
    method: 'GET',
    headers: {
          "authorization": `Bearer ${authToken}`
      },
    rejectUnauthorized: false,
    json: true
  }, (error, response, body) => {

    if(error){
      callback('There was an error connecting to the server');
    }
    else if(response.statusCode == 401 || response.statusCode == 400 ){
      callback('Unable to fetch cart');
    }
    else if(response.statusCode == 200){
      console.log('fetchCartService API hit:', response.statusCode)
      callback(undefined, {
        customer_address_id: body.data[0].address_id
        });
      }
  });

};

var setShipmentService = (authToken, customer_address_id, basket_id, callback) => {

  console.log('Setting shipment API hit');
  request({
    url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/baskets/${basket_id}/shipments/me/shipping_address?use_as_billing=true&customer_address_id=${customer_address_id}`,
    method: 'PUT',
    headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${authToken}`
      },
    body: {},
    rejectUnauthorized: false,
    json: true
  }, (error, response, body) => {

    if(error){
      callback('There was an error connecting to the server');
    }
    else if(response.statusCode == 401 || response.statusCode == 400){
      callback('Unable to set delivery mode for the cart');
    }
    else if(response.statusCode == 200){
      console.log("settingShipmentService API hit:", response.statusCode);
    }
  });

};

var setShipmentIdService = (authToken, basket_id, callback) => {

    console.log('Setting shipment id for a basket API hit');
    request({
      url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/baskets/${basket_id}/shipments/me/shipping_method`,
      method: 'PUT',
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${authToken}`
      },
      body: {
          "id":"cafcafe"
      },
      rejectUnauthorized: false,
      json: true
    }, (error, response, body) => {

      if(error){
        callback('There was an error connecting to the server');
      }
      else if(response.statusCode == 401 || response.statusCode == 400){
        callback('Unable to get saved card details for the user');
      }
      else if(response.statusCode == 200){
        console.log("settingShipmentIdService API hit:", response.statusCode);
        callback(undefined, {
          cardNumber: body.payments[0].cardNumber
          });
        }
    });
};

var addPaymentService = (authToken, basket_id, callback) => {

      console.log('Adding payment API hit', cardId);
      request({
        url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/baskets/${basket_id}/payment_instruments`,
        method: 'POST',
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${authToken}`
         },
        body: {
          "amount" : 58.69,
          "payment_card" : {
                     "number":"411111111111111",
                     "security_code":"121",
                     "holder":"John Doe",
                     "card_type":"Visa",
                     "expiration_month":1,
                     "expiration_year":2021
                    },
          "payment_method_id" : "CREDIT_CARD"
        },
        rejectUnauthorized: false,
        json: true
         }, (error, response, body) => {

        if(error){
          callback('There was an error connecting to the server');
        }
        else if(response.statusCode == 401 || response.statusCode == 400){
          callback('Unable to add payment_method for the cart');
        }
        else if(response.statusCode == 200){
          console.log("addCardPaymentService API hit:", response.statusCode);
         }
      });
};

var placeOrderService = (authToken, basket_id, callback) => {

        console.log('Placing order API hit');
        request({
          url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/orders`,
          method: 'POST',
          headers: {
           "content-type": "application/json",
           "authorization": `Bearer ${authToken}`
           },
          body: {
            "basket_id": basket_id
          },
          rejectUnauthorized: false,
          json: true
          }, (error, response, body) => {

          if(error){
            callback('There was an error connecting to the server');
          }
          else if(response.statusCode == 401 || response.statusCode == 400){
            callback('Unable to place an order');
          }
          else if(response.statusCode == 200){
            console.log("Place order API hit:", response.statusCode);
            callback(undefined, {
              code: body.order_no,
              payment_id: body.payment_instruments[0].payment_instrument_id
              });
          }
     });
};




var updatePaymentService = (authToken, order_no, payment_id, callback) => {

        console.log('Update payment API hit');
        request({
          url: `https://capgemini01-alliance-prtnr-eu06-dw.demandware.net/s/CapCafe/dw/shop/v18_3/orders/${order_no}/payment_instruments/${payment_id}`,
          method: 'PATCH',
          headers: {
           "content-type": "application/json",
           "authorization": `bearer ${authToken}`
          },
          body: {
                "amount" : 58.69,
                "payment_card" : {
                  "card_type":"Visa"
                 },
                "payment_method_id" : "CREDIT_CARD"
          },
          rejectUnauthorized: false,
          json: true
          }, (error, response, body) => {

          if(error){
            callback('There was an error connecting to the server');
          }
          else if(response.statusCode == 400){
            callback('Unable to get recommended products');
          }
          else if(response.statusCode == 200){
            console.log("Get recommended product API hit:", response.statusCode);
            }
         });
};

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = {
    getAuthTokenService,
    getProductDetailsService,
    createCartService,
    addProductsToCart,
    getAddressService,
    setShipmentService,
    setShipmentIdService,
    addPaymentService,
    placeOrderService,
    updatePaymentService
};