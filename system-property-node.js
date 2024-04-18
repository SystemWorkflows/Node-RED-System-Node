module.exports = function (RED) {
    function SystemPropertyNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        node.on('input', async function (msg, send, done) {
            let thingPropertyValue = JSON.parse(config.thingPropertyValue);

            let thingURI = thingPropertyValue.uri;
            let property = thingPropertyValue.property;

            let output = await fetch(
                thingURI + "/properties/" + property, 
                {
                    method: "GET",
                    headers: new Headers({
                        "Content-Type": "application/json"
                    })
                }
            )
            .catch((reason) => {
                node.error("Failed to access property", reason);
            });

            msg.payload = await output.json();

            node.send(msg);
        });
    }

    RED.nodes.registerType("system-property-node", SystemPropertyNode);
}