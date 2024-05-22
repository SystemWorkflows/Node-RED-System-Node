'use strict'

const WoTProm = require("./WoTSingleton").getInstance();

module.exports = function (RED) {
    function SystemEventNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        node.subscribed = false;
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

        fetchEvents(thingEventValue.uri);

        /**
         * Fetches the events from the given uri and initiates event subscription when successful
         * @param {*} uri The uri of the Thing to be queried
         */
        function fetchEvents(uri) {
            fetch(
                uri,
                { method: "GET" }
            )
            .then(async (response) => {
                setUpEventSubscription(await response.json(), thingEventValue.event);
                
                node.subscribed = true;

                if (node.subscribed) {
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

                setTimeout(() => fetchEvents(uri), 5000);
            });
        }

        async function setUpEventSubscription(thingDescription, event) { //Logic taken from @node-wot
            let WoT = await WoTProm;
            let consumedThing = await WoT.consume(thingDescription)
            
            try {
                while (true) { //Repeat until successful subscription
                    let subscription = attemptSubscription(consumedThing, event);

                    if (subscription) return subscription;

                    await timeout();
                }
            }
            catch(reason) {
                node.status({
                    fill: 'red',
                    shape: 'ring',
                    text: 'Subscription error',
                });
    
                node.error(`[error] Failed to create consumed thing for events. err: ${reason.toString()}`);
            };
        }

        function attemptSubscription(consumedThing, event) {
            return consumedThing.subscribeEvent(
                event,
                async (response) => {
                    if (response) {
                        let payload;

                        try {
                            payload = await response.value();
                        } catch (err) {
                            node.error(`[error] failed to read event value. ${err.toString()}`);
                            return;
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
                    node.error(`[error] subscribe events. ${err.toString()}`);
                    node.status({
                        fill: 'red',
                        shape: 'ring',
                        text: 'Subscription error',
                    });

                    setTimeout(() => attemptSubscription(consumedThing, event), 5000);
                }
            )
            .catch((err) => {
                console.warn('[warn] event subscription error. try again. ' + err);
            });
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