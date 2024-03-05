module.exports = function (RED) {
    function SystemNode(config) {
        RED.nodes.createNode(this, config);

        //Node credentials
        var node = this;

        // var thingDirectoryURI = node.credentials.thingDirectoryURI;
        // var thingFunction = node.credentials.thingFunction;
        // var outputToMsg = node.credentials.outputToMsg;

        //Variables
        var currentThingURI = "";

        // node.on('input', function (msg) {
        //     try {
        //         let output = fetch(
        //             currentThingURI, 
        //             {
        //                 method: "POST",
        //                 headers: new Headers({
        //                     "Access-Control-Allow-Origin": "*",
        //                 }),
        //                 body: msg.payload,
        //             }
        //         );
        //     }
        //     catch {
        //         //TODO: Handle error for Node-RED
        //     }

        //     if (outputToMsg) {
        //         msg.payload = output;
        //     }

        //     node.send(msg);
        // });

        // node.on("oneditsave", function () {
        //     //route function to thing providing it
        // });
    }

    RED.nodes.registerType("system-node", SystemNode);
}