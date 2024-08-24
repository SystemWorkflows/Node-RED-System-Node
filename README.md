# Node-RED System Node

### What is the project?

This [Node-RED](https://nodered.org/) extension provides new nodes, making use of the [Web of Things (WoT)](https://www.w3.org/WoT/) framework. These nodes enable developers to address Thing/device functionality without specifically addressing each device.

### Aims of this project

This project aims to enable IoT system workflows to be produced without the need to remember or address the specific devices within a system, reducing burden on developers creating these systems and simplifying workflow construction.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Installing
Note: These instructions are for Windows machines only, and requires npm and Node-RED to be installed.

#### Clone this repository.

```
git clone https://github.com/warburec/Generalised-Compilation.git
```

#### Install system-node to your Node-RED installation.

Create the following files with their content:
**install_in_node.cmd**
```
@echo off

echo Installing system-node for Node-RED
cd <<Path to your ".node-red" folder>>
cmd /C npm uninstall Node-RED-System-Node
cmd /C npm install <<Path to your copy of this repository>>
```

**start_test_node_RED.cmd**
```
@echo off

start /b .\commands\install_in_node.cmd &
@REM start /b .\commands\startServer.cmd &
cd <<Path to the directory from which to run the Node-RED server>>
cmd /C node-red
```

**startServer.cmd**
```
@echo off

echo starting
node server.js
```

Run **start_test_node_RED.cmd**

### Usage
With the server running, go to **http://localhost:1880/** to open the Node-RED editor.

The following nodes should be visible within the **Web of Things** panel on the left of the editor, within the node list:
- **system-action-node**
- **system-event-node**
- **system-property-node**

## Contributing

Make a pull request. Make an issue for large changes.

## Author

<a href="https://github.com/warburec">
    <span style="display: block;">
        <img src="https://images.weserv.nl/?url=avatars.githubusercontent.com/u/77669019?v=4&fit=cover&mask=circle&maxage=7d" style="width:8%;height:8%;vertical-align: middle;"/>
        <b style="vertical-align: middle;">Ewan Warburton</b>
    </span>
</a>

## Contributors

<a href="https://github.com/warburec//Node-RED-System-Node/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=warburec//Node-RED-System-Node" />
</a>

## License

See [LICENSE.md](LICENSE.md)
