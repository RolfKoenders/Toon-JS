
var config = require('./config.json');
var ToonLib = require('./lib/Toon.js');

// Create instance
var Toon = new ToonLib(config.email, config.password);

// Login
Toon.login()
    .then(function(response) {
        console.log('Login', response);
        return response;
    })
    .then(function(res) {
        var power = Toon.getPowerUsage();
        console.log('[Toon] - Power: ', power);
        return power;
    })
    .then(function(res) {
        // Always logout
        return Toon.logout();
    })
    .then(function(res) {
        console.log('Logout ', res);  
    })
    .catch(function(error) {
        console.log('error', error);
    });



