/*
 * Visualization source
 */
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
            'd3',
            'three',
            'three-spritetext',
            '3d-force-graph',
            'force-graph',
            'tinycolor2'
            // Add required assets to this list
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3,
            THREE,
            SpriteText,
            ForceGraph3D,
            ForceGraph,
            tinycolor
        ) {

    var MAX_EDGE_SZ = 18; // 18px
    var MIN_LARGE_GRAPH = 500;
    const NODE_R = 4;

    var COLOR_SRC_NODE_FIELDNAME = "color_src";
    var COLOR_DEST_NODE_FIELDNAME = "color_dest";
    var SZ_SRC_NODE_FIELDNAME = "weight_src";
    var SZ_DEST_NODE_FIELDNAME = "weight_dest";
    var COLOR_EDGE_FIELDNAME = "edge_color";
    var SZ_EDGE_FIELDNAME = "edge_weight";

    // Extend from SplunkVisualizationBase
    return SplunkVisualizationBase.extend({

        initialize: function() {
            this.logging = false;
            if(this.logging) console.log('initialize() - Entered');

            SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
            this.graph = null;
            this.hasToggledGraph = false;
            this.disableDagMode = false;

            this.$el = $(this.el);
            this.uuid = this._getUUID();
            // this.$el.css('id','viz_base')
            this.$el.append('<div class="graphviz-container" name="' + this.uuid + '"></div>');
            var controllerbar = '<div class="graphviz-controllers" name="cntl' + this.uuid + '">' +
                                    '<a id="btnPlayAnimation" style="margin: 8px;" href="#" class="btn btn-primary">' +
                                        '<i class="icon-play"></i></a>' +
                                    '<a id="btnPauseAnimation" style="margin: 8px;" href="#" class="btn btn-primary">' +
                                        '<i class="icon-pause"></i></a>' +
                                '</div>';
            this.$el.append(controllerbar);

            var that = this;

            setTimeout(() => {
              $('div[name=cntl'+that.uuid+'] > a#btnPlayAnimation').on('click', event => {
                event.preventDefault(); // to avoid re-direction
                that._toggleAnimation(1);
              });

              $('div[name=cntl'+that.uuid+'] > a#btnPauseAnimation').on('click', event => {
                event.preventDefault(); // to avoid re-direction
                that._toggleAnimation(0);
              });
            }, 100);
        },

        // Called at every change to visualization format
        // config contains only the change to the viz configuration
        onConfigChange: function(config) {
            if(this.logging) console.log('onConfigChange() - Entered');

            var key_tokens = Object.keys(config)[0].split(/[\s.]+/);

            if (this.disableDagMode && ('dagMode') === key_tokens[key_tokens.length-1]) {
                var dagMode = this._normalizeNull(this._getEscapedProperty('dagMode', config) || 'null');

                if (dagMode !== null) {
                    // Show error
                    $('splunk-select[name$=dagMode] > a').css("border", "2px solid red");
                    var errMsg = "DAG mode must be disabled as current data contains cycle nodes",
                        errMsgHtml = '<div class="error-msg">' +
                                        '<span>' + errMsg + '</span>' +
                                     '</div>';

                    if ($('div.error-msg').length < 1)
                        $('splunk-select[name$=dagMode]').parents('splunk-control-group').append(errMsgHtml);

                    return;
                }

                // Remove error message and restore style
                $('splunk-select[name$=dagMode] > a').css("border", "1px solid rgb(195, 203, 212)");
                $('div.error-msg').remove();
            }

            if ('showAnimationBar' === key_tokens[key_tokens.length-1]){
                // Show / Hide Animation bar 
                var showAnimationBar = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('showAnimationBar', config));

                this._toggleAnimationBar(showAnimationBar);
                return;
            }

            // Keep track of 2D-3D graph toggle
            this.hasToggledGraph = ('enable3D' === key_tokens[key_tokens.length - 1]);

            if (this.hasToggledGraph || key_tokens[key_tokens.length - 1].endsWith("Color")
                || key_tokens[key_tokens.length - 1].endsWith('LinkArrows')
                || key_tokens[key_tokens.length - 1].endsWith('Labels') ) {
                    // 3D / 2D Graph toggled | Color changed | Arrows state changed | Labels toggled --> Force viz re-render.
                    this.invalidateUpdateView();
                    return;
            }

            this.invalidateFormatData();
        },

        // Optionally implement to format data returned from search.
        // The returned object will be passed to updateView as 'data'
        formatData: function(data) {
            if(this.logging) console.log('formatData() - Entered');
            // Expects:
            // <search> | stats count by src dst

            var config = this.getCurrentConfig();
            var fields = data.fields;
            var rows = data.rows;
            var that = this;
            var nodes = [],
                links = [],
                idxLkColor = -1,
                idxLkWidth = fields.findIndex(obj => obj.name === SZ_EDGE_FIELDNAME),
                idxNdColor = -1,
                idxNdSize = -1,
                idxNdColorDst = -1,
                idxNdSizeDst = -1;

            if (rows.length < 1 && fields.length < 1) {
                return false;
            }

            // Extra customisation fields given
            if (fields.length > 3) {
                if(this.logging) console.log('formatData() - Got extra customisation fields');

                idxNdColor = fields.findIndex(obj => obj.name === COLOR_SRC_NODE_FIELDNAME);
                idxNdSize = fields.findIndex(obj => obj.name === SZ_SRC_NODE_FIELDNAME);
                idxNdColorDst = fields.findIndex(obj => obj.name === COLOR_DEST_NODE_FIELDNAME);
                idxNdSizeDst = fields.findIndex(obj => obj.name === SZ_DEST_NODE_FIELDNAME);
                idxLkColor = fields.findIndex(obj => obj.name === COLOR_EDGE_FIELDNAME);
            }

            // Avoid duplicates!
            let nodeIds = new Set();
            var defaultColors = {
                "node": this._getEscapedProperty('ndColor', config) || '#EDCBB1',
                "link": this._getEscapedProperty('lkColor', config) || '#ffffff'
            };

            _.each(rows, function(row) {
                // Iterating over 0-1 to get row columns
                _.each([...Array(2).keys()], function(ix) {
                    // ix = {0 src : 1 dest}
                  var id = row[ix],
                      name = id;
                      // name = fields[ix].name + ": " + id;

                  if (!nodeIds.has(id)) {
                    var newNode = {
                        "id": id,
                        "name": name,
                        "val": 1,
                        "has_custom_color": 0,
                        "type": ix,
                        "color": defaultColors['node']
                    };
                    // Setting custom weigth and colors
                    if (ix < 1) {
                        if (idxNdColor > 0) {
                          newNode['color'] = row[idxNdColor];
                          newNode['has_custom_color'] = 1;
                        }
                        if (idxNdSize > 0) newNode['val'] = row[idxNdSize];
                    } else {
                        if (idxNdColorDst > 0) {
                          newNode['color'] = row[idxNdColorDst];
                          newNode['has_custom_color'] = 1;
                        }
                        if (idxNdSizeDst > 0) newNode['val'] = row[idxNdSizeDst];
                    }

                    // Sanity checks
                    if (newNode.hasOwnProperty('color')) {
                        if (newNode['color'] && !newNode['color'].match("^#")) {
                          throw new SplunkVisualizationBase.VisualizationError(
                              'Check the Statistics tab. To assign custom colors to nodes, valid hex codes shall be returned.'
                          );
                        }
                    }
                    if (newNode['val'] && newNode['val'] != parseFloat(newNode['val'])) {
                        throw new SplunkVisualizationBase.VisualizationError(
                            'Check the Statistics tab. To assign custom weights to nodes, valid numbers shall be returned.'
                        );
                    }

                    nodes.push(newNode);
                    nodeIds.add(id);

                  } else {
                    // console.log("Checking node type (src or dest?)");
                    let nodeIdx = _.findIndex(nodes, function (nodeItem) { return nodeItem.id == id });

                    if (nodes[nodeIdx].type != ix) {
                        // console.log("Node is both source and destination!");
                        let colorSrc = idxNdColor !== -1 ? row[idxNdColor] : defaultColors["node"],
                            colorDest = idxNdColorDst !== -1 ? row[idxNdColorDst] : defaultColors["node"];
                        nodes[nodeIdx].color = [that._hexToRgb(colorSrc), that._hexToRgb(colorDest)];
                    }
                  }
                });

                // Check for loops in data > DAG mode limited
                if (row[0] === row[1]) that.disableDagMode = true;

                var newLink = {
                    "source": row[0],
                    "target": row[1],
                    "width": idxLkWidth > 0 ? row[idxLkWidth] : 0,
                    "has_custom_color": 0,
                    "color": defaultColors['link']
                };

                // Setting custom color to link
                if (idxLkColor > 0 && row[idxLkColor].length > 0) {
                    // Sanity checks
                    if (!row[idxLkColor].match("^#")) {
                        throw new SplunkVisualizationBase.VisualizationError(
                            'Check the Statistics tab. To assign custom colors to edges, valid hex codes shall be returned.'
                        );
                    }
                    newLink["color"] = row[idxLkColor];
                    newLink["has_custom_color"] = 1;
                }

                links.push(newLink);
            });

            return {
              "fields": fields,
              "content": {
                "nodes": nodes,
                "links": links
              },
              "status": data.meta.done
            };
        },

        // Implement updateView to render a visualization.
        //  'data' will be the data object returned from formatData or from the search
        //  'config' will be the configuration property object
        updateView: function(data, config) {
            if (this.logging) console.log("updateView() - Entering");

            var $elem = $('div.graphviz-container[name=' + this.uuid + ']');

            // check for data
            if (!data || data.content.nodes.length < 1) {
                if (this.logging) console.log('updateView() - Error: no data');
                return;
            }

            // check for data readiness
            if (!data.status) {
                if (this.logging) console.log("Search job is still running. Please wait.");
                // Trying to dispose here
                this._disposeGraph($elem);
                return;
            }

            const isLarge = data.content.nodes.length > MIN_LARGE_GRAPH;

            var enable3D = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('enable3D', config));
            var showAnimationBar = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('showAnimationBar', config));
            var showLinkArrows = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('showLinkArrows', config));
            var params = {
                "bgColor": this._getEscapedProperty('bgColor', config) || '#000011',
                "showLabels": SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('showNodeLabels', config)),
                "dagMode": this._normalizeNull(this._getEscapedProperty('dagMode', config) || 'null'),
                "lkColor": this._getEscapedProperty('lkColor', config) || '#ffffff',
                "ndColor": this._getEscapedProperty('ndColor', config) || '#EDCBB1',
                "cameraController": this._getEscapedProperty('cameraController', config) || 'trackball',
                "isLarge": isLarge,
                "warmupTicks": isLarge ? Math.pow(data.content.nodes.length, 0.7) * 4 : 0
            };
            this.useDrilldown = this._isEnabledDrilldown(config);

            // Show/Hide Animation Bar
            this._toggleAnimationBar(showAnimationBar);

            // Dispose current graph
            if (this.hasToggledGraph) {
                this._disposeGraph($elem);
            }

            // Create the required graph
            if (enable3D) {
                if (this.graph == null){
                    if (this.logging) console.log("updateView() - Loading [3D] graph");
                    this._load3DGraph($elem.get(0), params);
                }

                // Add node customisations to the 3D Graph
                this.graph.nodeThreeObject(node => {
                    const group = new THREE.Group();

                    // Drawing nodes
                    const useDefaultColor = node.has_custom_color < 1;
                    if ((!useDefaultColor) && (node.color instanceof Array)) {
                        // Gradient
                        const geometry = new THREE.SphereGeometry();
                        const color1 = new THREE.Color(node.color[0]);
                        const color2 = new THREE.Color(node.color[1]);
                        const position = geometry.attributes.position;
                        const colors = [];

                        geometry.computeBoundingSphere();
                        const radius = geometry.boundingSphere.radius;

                        // Apply vertex colors for the gradient
                        for (let i = 0; i < position.count; i++) {
                            // Normalize vertex.y to [0, 1]
                            const y = (position.getY(i) / radius + 1) / 2;
                            // Interpolate between color1 and color2 based on normalized y
                            const vertexColor = color2.clone().lerp(color1, y);
                            colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
                        }

                        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                        // Standard material using vertex colors instead of gradient shader
                        const material = new THREE.MeshBasicMaterial({
                            vertexColors: true
                        });
                        group.add(new THREE.Mesh(geometry, material));
                    } else {
                        // No gradient
                        geometry = new THREE.SphereGeometry();
                        material = new THREE.MeshBasicMaterial({
                            color: useDefaultColor ? params['ndColor'] : node.color
                        });
                        group.add(new THREE.Mesh(geometry, material));
                    }

                    // Show labels if needed
                    if (params["showLabels"]) {
                        // !! Added .default to avoid error "SpriteText is not a constructor"
                        const sprite = new SpriteText.default(node.name);
                        sprite.material.depthWrite = false; // make sprite background transparent
                        sprite.color = tinycolor(params['bgColor']).isLight() ?
                            "rgba(0,0,0,.8)" : "rgba(255,255,255,.8)";
                        sprite.textHeight = 2;
                        sprite.offsetY = NODE_R * 1.5;
                        group.add(sprite);
                    }

                    return group;
                });

                if (this.logging) console.log("updateView() - Rendering [3D] graph");
            } else {
                if (this.graph == null){
                    if (this.logging) console.log("updateView() - Loading [2D] graph");
                    this._load2DGraph($elem.get(0), params);
                }

                // Add node customisations to the 2D Graph
                this.graph.nodeCanvasObject((node, ctx, globalScale) => {
                    // Drawing nodes
                    if (node.color instanceof Array) {
                        // Gradient
                        if (node.x !== undefined && node.y !== undefined) {
                            var gradient = ctx.createLinearGradient(node.x - NODE_R, node.y, node.x + NODE_R, node.y);
                            gradient.addColorStop(0, node.color[0]);
                            gradient.addColorStop(1, node.color[1]);
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
                            ctx.fillStyle = gradient;
                            ctx.fill();
                        }
                    } else {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.color;
                        ctx.fill();
                    }

                    // Show labels if needed
                    if (params["showLabels"]) {
                        const fontSize = 12 / globalScale;
                        const paddingScreenPx = 5;
                        const verticalOffsetScreenUnits = (2 * NODE_R) + paddingScreenPx / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.fillStyle = tinycolor(params['bgColor']).isLight() ?
                            "rgba(0,0,0,.8)" : "rgba(255,255,255,.8)";
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(node.name, node.x, node.y - verticalOffsetScreenUnits);
                    }
                });

                if (this.logging) console.log("updateView() - Rendering [2D] graph");
            }

            this.graph.linkColor(link => link.color =
                    link.has_custom_color < 1 ? params['lkColor'] : link.color)
                .backgroundColor(params["bgColor"])
                .dagMode(params["dagMode"])
                .linkDirectionalArrowLength(showLinkArrows ? 4.5 : 0)
                .linkDirectionalArrowRelPos(0.5)
                .graphData(data.content);
        },

        // Search data params
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 0
            });
        },

        _disposeGraph: function($elem) {
            if (this.graph != null) {
                if (this.logging) console.log("_disposeGraph() - Disposing currently rendered graph");
                // Stop frame animation engine + Clean data structure
                this.graph._destructor();

                // Dispose the WebGL renderer (3D graph only)
                if (typeof this.graph.renderer == 'function') {
                    this.graph.renderer().dispose();
                }

                // Remove all child nodes from DOM
                $elem.empty();

                this.graph = null;
            }
        },

        _load2DGraph: function(elem, params){
            var that = this;

            this.graph = ForceGraph.default()(elem)
                .backgroundColor(params['bgColor'])
                .warmupTicks(params["warmupTicks"])
                .cooldownTime(5000)
                .linkWidth(link => link.width > MAX_EDGE_SZ ? MAX_EDGE_SZ : link.width)
                .dagMode(params['dagMode'])
                .onNodeHover(node => {
                    // Change cursor when hovering on nodes (if drilldown enabled)
                    elem.style.cursor = node && that.useDrilldown ? 'pointer' : null;
                })
                .onNodeClick(that._drilldown.bind(that));
        },

        _load3DGraph: function(elem, params){
            const distance = 1000;
            var that = this;

            this.graph = ForceGraph3D.default({ controlType: params['cameraController'] })(elem)
              .nodeResolution(params["isLarge"] ? 4 : 8)
              .linkDirectionalArrowResolution(params["isLarge"] ? 4 : 8)
              .linkResolution(params["isLarge"] ? 3 : 6)
              .cooldownTime(5000) // freeze layout engine after 5s
              .warmupTicks(params["warmupTicks"]) // set no of layout engine cycles to dry-run before start rendering
              .cameraPosition({ z: distance })
              .onNodeHover(node => {
                // Change cursor when hovering on nodes (if drilldown enabled)
                elem.style.cursor = node && that.useDrilldown ? 'pointer' : null;
              })
              .onNodeClick(that._drilldown.bind(that))
              .backgroundColor(params['bgColor'])
              .linkWidth(link => link.width > MAX_EDGE_SZ ? MAX_EDGE_SZ : link.width)
              .dagMode(params['dagMode']);
        },

        _getUUID: function () {
          return '_' + Math.random().toString(36).substr(2, 9);
        },

        _isEnabledDrilldown: function(config) {
          return (config['display.visualizations.custom.drilldown']
                  && config['display.visualizations.custom.drilldown'] === 'all');
        },

        _drilldown: function(d, i) {
            if(this.logging) console.log("drilldown() - Entered");

            var fields = this.getCurrentData().fields;
            var drilldownDescription = {
                action: SplunkVisualizationBase.FIELD_VALUE_DRILLDOWN,
                data: {}
            };

            drilldownDescription.data[fields[0].name] = d.id;

            this.drilldown(drilldownDescription, d3.event);
        },

        _getEscapedProperty: function(name, config) {
            var propertyValue = config[this.getPropertyNamespaceInfo().propertyNamespace + name];
            if (propertyValue !== undefined ) propertyValue = propertyValue.replace(/"/g, '');
            return SplunkVisualizationUtils.escapeHtml(propertyValue);
        },

        _toggleAnimation: function(value) {
            if(this.logging) console.log('_toggleAnimation() - Resuming Animation ? ' + value);

            var resumeAnimation = SplunkVisualizationUtils.normalizeBoolean(value);

            var config = this.getCurrentConfig();
            var enable3D = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('enable3D', config));

            if (enable3D) {
                resumeAnimation ? this.graph.resumeAnimation() : this.graph.pauseAnimation();
                return;
            }

            // Handle Animation for 2D Graph
            if (!resumeAnimation) {
                this.graph.pauseAnimation();
                this.graph.enableZoomPanInteraction(false);

                // Work-around a library misbehaviour
                var max = 2,
                    cnt = 0,
                    id = setInterval(() => {
                      while(cnt < max) {
                        this.graph.resumeAnimation();
                        this.graph.pauseAnimation();
                        cnt = cnt + 1;
                      }
                      clearInterval(id);
                    }, 50);
                return;
            }

            // Work-around a library misbehaviour
            this.graph.pauseAnimation();
            this.graph.resumeAnimation();
            this.graph.enableZoomPanInteraction(true);
        },

        _toggleAnimationBar: function(value) {
            if (this.logging) console.log("_toggleAnimationBar() - Entered {"+value+"}");

            var $elem = $('div.graphviz-controllers[name=cntl'+this.uuid+']');

            if (value && !$elem.hasClass("show")) {
                $elem.toggleClass("show");
            } else if (!value && $elem.hasClass("show")) {
                $elem.toggleClass("show");
            }
        },

        _hexToRgb: function(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

            return "rgb(" + parseInt(result[1], 16)
                    + "," + parseInt(result[2], 16)
                    + "," + parseInt(result[3], 16) + ")";
        },

        _normalizeNull: function(value) {
            return value === "null" ? null : value;
        }

    });
});
