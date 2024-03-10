'use strict'

const { default: Servient } = require("@node-wot/core");
const HttpClientFactory = require("@node-wot/binding-http").HttpClientFactory;
const HttpsClientFactory = require("@node-wot/binding-http").HttpsClientFactory;
const WSClientFactory = require('@node-wot/binding-websockets').WebSocketClientFactory
const CoapClientFactory = require('@node-wot/binding-coap').CoapClientFactory
const CoapsClientFactory = require('@node-wot/binding-coap').CoapsClientFactory
const MqttClientFactory = require('@node-wot/binding-mqtt').MqttClientFactory
// const OpcuaClientFactory = require('@node-wot/binding-opcua').OpcuaClientFactory
// const ModbusClientFactory = require('@node-wot/binding-modbus').ModbusClientFactory

const servient = new Servient();

servient.addClientFactory(new HttpClientFactory());
servient.addClientFactory(new HttpsClientFactory());
servient.addClientFactory(new WSClientFactory());
servient.addClientFactory(new CoapClientFactory());
servient.addClientFactory(new CoapsClientFactory());
servient.addClientFactory(new MqttClientFactory());
// servient.addClientFactory(new OpcuaClientFactory());
// servient.addClientFactory(new ModbusClientFactory());

var WoTProm = servient.start();

module.exports = function (RED) {
    function SystemEventNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        this.subscription = undefined;
        this.status({});

        var thingEventValue = {};
        try {
            thingEventValue = JSON.parse(config.thingEventValue);
        }
        catch {
            //Do nothing
        }

        if (!thingEventValue.uri) {
            this.status({ fill: 'red', shape: 'dot', text: 'Error: Thing undefined' });
            return;
        } else if (!thingEventValue.event) {
            this.status({ fill: 'red', shape: 'dot', text: 'Error: Choose an event' });
            return;
        }

        fetch(
            thingEventValue.uri,
            { method: "GET" }
        )
        .then(async (response) => {
            setUpEventSubscription(await response.json(), thingEventValue.event);
            
            node.subscription = subscription;

            if (node.subscription) {
                node.status({
                    fill: 'green',
                    shape: 'dot',
                    text: 'Subscribed',
                });
            }
        })
        .catch((reason) => {
            node.status({
                fill: 'red',
                shape: 'ring',
                text: 'Connection error',
            });

            node.error(`[error] Failed to access ` + thingEventValue.uri);
        });

        async function setUpEventSubscription(thingDescription, event) { //Logic taken from @node-wot
            let WoT = await WoTProm;

            let consumedThing = await WoT.consume(thingDescription);

            try {
                while (true) { //Repeat untill successful subscription
                    let subscription = attemptSubscription(consumedThing, event);

                    if (subscription) {
                        return subscription;
                    }

                    await timeout();
                }
            }
            catch(reason)  {
                node.status({
                    fill: 'red',
                    shape: 'ring',
                    text: 'Subscription error',
                });
    
                node.error(`[error] Failed to create consumed thing for events. err: ${reason.toString()}`);
            }
        }

        function attemptSubscription(consumedThing, event) {
            let subscription = consumedThing.subscribeEvent(
                event,
                async (response) => {
                    if (response) {
                        let payload;

                        try {
                            payload = await response.value();
                        } catch (err) {
                            node.error(`[error] failed to get event. err: ${err.toString()}`);
                            console.error(`[error] failed to get event. err: `, err);
                        }

                        node.send({ payload });
                    }

                    node.status({
                        fill: 'green',
                        shape: 'dot',
                        text: 'Subscribed',
                    });
                },
                (err) => {
                    console.error('[error] subscribe events.', err);
                    node.error(`[error] subscribe events. err: ${err.toString()}`);
                    node.status({
                        fill: 'red',
                        shape: 'ring',
                        text: 'Subscription error',
                    });
                },
                () => {
                    console.error('[warn] Subscription ended.');
                    node.warn('[warn] Subscription ended.');
                    node.status({});
                    node.subscription = undefined;
                }
            )
            .catch((err) => {
                console.warn('[warn] event subscription error. try again. error: ' + err);
            });

            return subscription;
        }

        async function timeout() {
            return new Promise((resolve, reject) => {
                setTimeout(
                    () => resolve(),
                    500
                );
            });
        }
    }

    RED.nodes.registerType('system-event-node', SystemEventNode);
}