
var uuid = require('node-uuid');
var rp = require('request-promise');

function Toon(email, password) {
    this.baseUrl = 'https://toonopafstand.eneco.nl/toonMobileBackendWeb/client';
    this.email = email;
    this.password = password;
    this.state = false;
    this.session = null;
}

Toon.prototype = {
    login: function() {
        var _this = this;
        var options = {
            method: 'GET',
            uri: this.baseUrl+'/login',
            qs: {
                username: this.email,
                password: this.password
            }
        };

        return rp(options)
            .then(function(response) {
                response = JSON.parse(response);
                if(response.success == false) {
                    throw response;
                }
                _this.session = response;
                var options = {
                    method: 'GET',
                    uri: _this.baseUrl+'/auth/start',
                    qs: {
                        clientId: _this.session.clientId,
                        clientIdChecksum: _this.session.clientIdChecksum,
                        agreementId: _this.session.agreements[0].agreementId,
                        agreementIdChecksum: _this.session.agreements[0].agreementIdChecksum,
                        random: uuid.v1()
                    }
                }; 
                return rp(options);
            })
            .then(function(response) {
                response = JSON.parse(response);
                if(response.success == false) {
                    console.log('of hier');
                    throw response;
                }
                return response;
            })
            .catch(function(err) {
                console.log('[Toon] - Login/Start Error: ', err);
                throw err;
            });
            
    },

    logout: function() {
        var _this = this;
        var options = {
            method: 'GET',
            uri: _this.baseUrl+'/auth/logout',
            qs: {
                clientId: _this.session.clientId,
                clientIdChecksum: _this.session.clientIdChecksum,
                random: uuid.v1()
            }
        };
        return rp(options)
            .then(function(response) {
                response = JSON.parse(response);
                console.log('[Toon] - Logout ', response);
                return response;
            })
            .catch(function(err) {
                console.log('[Toon] - Logout Error ', err);
                return err;
            });
    },

    getState: function(cb) {
        var _this = this;
        if(_this.state == false) {
            var options = {
                method: 'GET',
                uri: _this.baseUrl+'/auth/retrieveToonState',
                qs: {
                    clientId: _this.session.clientId,
                    clientIdChecksum: _this.session.clientIdChecksum,
                    random: uuid.v1()
                }
            };
            return rp(options)
                .then(function(response) {
                    response = JSON.parse(response);
                    if(response.success == false) {
                        throw response;
                    } 
                    _this.state = response;
                    cb(_this.state);
                })
                .catch(function(err) {
                    console.log('[Toon] - getState Error ', err);
                    return err;
                });
        } else {
            cb(_this.state);
        }
    },

    refreshState: function() {
        this.state = false;
        this.getState(function(){
            console.log('[Toon] - State refreshed');
        });
    },

    getPowerUsage: function() {
        this.getState(function(state) {
            console.log('callback');
            return state.powerUsage;
        });
    },

    getGasUsage: function() {
        this.getState(function(state) {
            return state.gasUsage;
        });
    },

    getThermostatInfo: function() {
        this.getState(function(state) {
            return state.thermostatInfo;
        });
    },

    getThermostatStates: function() {
        this.getState(function(state) {
            return state.thermostatStates;
        });
    }
};

module.exports = Toon;

