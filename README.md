# Splunk 3D Graph Network Topology Visualization

Plot relationships between objects with force directed graph based on ThreeJS/WebGL.

## Installation

- [Download Splunk for your platform](http://www.splunk.com/download?r=productOverview).
- Unpack/Install Splunk by running the downloaded files.
- Follow the instruction on the screen.

Splunk-3d-graph-network-topology-viz can be downloaded from **github** and installed in your Splunk platform. Access your Splunk instance via terminal and:
- browse to your apps directory `$SPLUNK_HOME/etc/apps/`
- download the app from github `git clone  https://github.com/splunk/splunk-3d-graph-network-topology-viz.git`
- Restart splunk to apply changes `$SPLUNK_HOME/bin/splunk restart`

## Usage
`<search> | stats count by src dest`

Replace `src` and `dest` with your fields to start.

### Customise Nodes
If you want to assign specific **colors** and/or **weights** to each single node, make sure to pass these fields **after the transforming command** in the search!

> **Valid fields syntax**: `color [<color_2>]` and `weight [<weight_2>]`

Optional fields refer to destination nodes, default values will be used if not given.

#### Example
* Add a lookup table defining these additional values to your Splunk instance. An example below:

    ```
    $~ cat <your_lookup_table>.csv
    source,color,weight
    A,#010101,50
    B,#ff0101,10
    ...
    ```

* Execute your SPL
    `<search> | stats count by src dest | lookup <your_lookup_table> source AS src | lookup <your_lookup_table> source AS dest OUTPUTNEW color AS color_dest, weight AS weight_dest`



## EOF 
* **:heart: it?** Tweet here : [`@splunk`](https://twitter.com/splunk) or email us at [`fdse [@] s p l u n k {.} C O M`](mailto:fdse@splunk.com?subject=[Splunk-3D-Graph-Network-Topology-Viz]%20Hi%20there!)
* Want to **contribute**? Great! Feel free to create a [PR](https://github.com/splunk/3d_graph_network_topology_viz/pulls)
* **Found a bug?** [Open an issue](https://github.com/splunk/3d_graph_network_topology_viz/issues/new)