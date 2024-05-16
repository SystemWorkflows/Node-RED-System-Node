module.exports = function (RED) {
    function SystemPropertyNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        node.on('input', async function (msg, send, done) {
            let thingPropertyValue = JSON.parse(config.thingPropertyValue);

            let thingURI = thingPropertyValue.uri;
            let property = thingPropertyValue.property;

            let output;

            if (config.mode === "read") {
                output = await readProperty(thingURI, property);
            }
            else if (config.mode === "write") {
                output = await writeProperty(thingURI, property, msg.payload);
            }

            if (output === undefined) return; //Failed to read/write
            
            if (output === null) {
                msg.payload = null;
            }
            else {
                msg.payload = await output.json();
            }

            node.send(msg);

            async function readProperty(thingURI, property) {
                let output;
                
                try {
                    output = await fetch(
                        thingURI + "/properties/" + property, 
                        {
                            method: "GET",
                            headers: new Headers({
                                "Content-Type": "application/json"
                            })
                        }
                    );
                }
                catch (reason) {
                    node.error("Failed to access property. " + reason);
                    return;
                }

                if (!output.ok) { 
                    node.error("Attempt to read the property resulted in a status code that was not OK");
                    return;
                }

                return output;
            }

            async function writeProperty(thingURI, property, value) {
                let output;

                try {
                    output = await fetch(
                        thingURI + "/properties/" + property, 
                        {
                            method: "PUT",
                            headers: new Headers({
                                "Content-Type": "application/json",
                            }),
                            "body": value
                        }
                    );
                }
                catch (reason) {
                    node.error("Failed to access property. " + reason);
                    return;
                };

                if(!output.ok) { 
                    node.error("Attempt to write to the property resulted in a status code that was not OK");
                    return;
                }

                if(output.status === 204) output = null;

                return output;
            }
        });
    }

    RED.nodes.registerType("system-property-node", SystemPropertyNode);
}