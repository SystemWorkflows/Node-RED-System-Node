'use strict'

const WoTProm = require("./WoTSingleton.js").getInstance();

var subscriptions = {}; //TODO: Handle multiple subscriptions to the same event

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

        let uri = thingEventValue.uri;
        let event = thingEventValue.event;

        if (!uri) {
            this.status({ fill: 'red', shape: 'dot', text: 'Error: Thing undefined' });
            return;
        } else if (!event) {
            this.status({ fill: 'red', shape: 'dot', text: 'Error: Choose an event' });
            return;
        }

        fetch(
            uri,
            { method: "GET" }
        )
        .then(async (response) => {
            let thingDescription = await response.json();

            let subscription = setUpEventSubscription(thingDescription, event);
            
            subscriptions[{uri, event}] = await subscription;

            console.log(subscribed);

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

            node.error(`[error] Failed to access ` + uri);
        });

        async function setUpEventSubscription(thingDescription, event) { //Logic taken from @node-wot
            let WoT = await WoTProm;
            
            let consumedThing = await WoT.consume(thingDescription);

            try {
                while (true) { //Repeat until successful subscription
                    console.log("before");
                    let subscription = await attemptSubscription(consumedThing, event);
                    console.log("Sub " + JSON.stringify(subscription));

                    if (subscription) {
                        console.log("Sub " + subscription);
                        return subscription;
                    }

                    console.log("timeout");
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
            return consumedThing.subscribeEvent(
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
        }

        async function timeout() {
            return new Promise((resolve) => {
                setTimeout(
                    () => resolve(),
                    500
                );
            });
        }
    }

    RED.nodes.registerType('system-event-node', SystemEventNode);
}

//========= Unsubscribe server ==========
const express = require('express');
var cors = require('cors')
const app = express();
const serverConfig = require("./serverConfig.json");
const bodyParser = require('body-parser');

const port = serverConfig.port;
app.use(cors());
const jsonParser = bodyParser.json()

function unsubscribe(req, res) {
    let uri = req.body.uri;
    let event = req.body.event;

    console.log("subs " + subscriptions[{uri, event}]);

    subscriptions[{uri, event}].stop()
    .catch((err) => {
        res.err('[warn] event unsubscribe error. try again. error: ' + err);
    });
}
app.post('/unsubscribe', jsonParser,unsubscribe);

app.get('/test', (req, res) => res.send("Server response"));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});