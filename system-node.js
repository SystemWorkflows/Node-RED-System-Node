/**
 * @returns Boolean, the completion of this functionality
 */
function refreshDirectoryFunctions(uri) {
    //TODO: Get URIs from ThingDirectory, get functions, add function (mapped to thing URI) to functionSelect (select html object)
    print("refresh here")
}

module.exports = function (RED) {
    function SystemNode(config) {
        RED.nodes.createNode(this, config);

        //Node credentials
        var node = this;
        var thingDirectoryURI = this.credentials.thingDirectoryURI;
        var thingFunction = this.credentials.thingFunction;
        var outputToMsg = this.credentials.outputToMsg;

        //Variables
        var currentThingURI = "";

        node.on('input', function (msg) {
            try {
                let output = fetch(
                    currentThingURI, 
                    {
                        method: "POST",
                        headers: new Headers({
                            "Access-Control-Allow-Origin": "*",
                        }),
                        body: msg.payload,
                    }
                );
            }
            catch {
                //TODO: Handle error for Node-RED
            }

            if (outputToMsg) {
                msg.payload = output;
            }

            node.send(msg);
        });

        const uriInputElement = node.querySelector("URIInput");
        uriInputElement.addEventListener("change", (event) => {
            refreshDirectoryFunctions(event.body);

            // this.status({fill:"red",shape:"ring",text:"disconnected"});
            // this.status({fill:"green",shape:"dot",text:"connected"});
        });

        node.on("oneditsave", function () {
            //route function to thing providing it
        });
    }

    RED.nodes.registerType("system-node", SystemNode);
}