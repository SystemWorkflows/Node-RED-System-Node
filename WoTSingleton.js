'use strict'

const Servient = require('@node-wot/core').Servient
const HttpClientFactory = require('@node-wot/binding-http').HttpClientFactory
const HttpsClientFactory = require('@node-wot/binding-http').HttpsClientFactory
const WSClientFactory = require('@node-wot/binding-websockets').WebSocketClientFactory
const CoapClientFactory = require('@node-wot/binding-coap').CoapClientFactory
const CoapsClientFactory = require('@node-wot/binding-coap').CoapsClientFactory
const MqttClientFactory = require('@node-wot/binding-mqtt').MqttClientFactory
// const OpcuaClientFactory = require('@node-wot/binding-opcua').OpcuaClientFactory
// const ModbusClientFactory = require('@node-wot/binding-modbus').ModbusClientFactory

module.exports = class WoTSingleton {
    static #WoTProm;

    constructor() {} //Private constructor

    static getInstance() {
        if(this.WoTProm !== undefined) {
            return this.WoTProm;
        }

        this.WoTProm = new Promise((resolve, reject) => {
            let servient = new Servient();

            servient.addClientFactory(new HttpClientFactory());
            servient.addClientFactory(new HttpsClientFactory());
            servient.addClientFactory(new WSClientFactory());
            servient.addClientFactory(new CoapClientFactory());
            servient.addClientFactory(new CoapsClientFactory());
            servient.addClientFactory(new MqttClientFactory());
            // servient.addClientFactory(new OpcuaClientFactory());
            // servient.addClientFactory(new ModbusClientFactory());

            servient.start()
            .then((thingFactory) => resolve(thingFactory))
            .catch((err) => reject(err));
        });

        return this.WoTProm;
    }
}