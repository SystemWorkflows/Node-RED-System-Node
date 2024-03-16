const express = require('express');
const app = express();
const serverConfig = require("./serverConfig.json");
const port = serverConfig.port;

const WoT = await require("./WoTSingleton.js").getInstance();

var subscriptions = {};

function subscribe(req, res) {
    let thingDescription, event = req;

    let consumedThing = WoT.consume(thingDescription);

    let subscription = consumedThing.subscribeEvent(
        event,
        async (response) => {
            if (!response) return;

            console.log("GOT RESPONSE");

            let payload;

            try {
                payload = await response.value();
            } catch (err) {
                res.error(`[error] failed to get event. err: ${err.toString()}`);
            }

            res.send({ payload });
        },
        (err) => res.error('[error] subscribe events.', err),
        () => res.warn('[warn] Subscription ended.')
    )
    .catch((err) => {
        res.err('[warn] event subscription error. try again. error: ' + err);
    });

    subscriptions[{thingDescription, event}] = subscription;
}
app.get('/subscribe', subscribe);

function unsubscribe(req, res) {
    let thingDescription, event = req;

    subscriptions[{thingDescription, event}].stop()
    .catch((err) => {
        res.err('[warn] event unsubscribe error. try again. error: ' + err);
    });
}
app.get('/unsubscribe', unsubscribe);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});