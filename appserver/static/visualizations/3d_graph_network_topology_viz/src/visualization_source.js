/*
 * Visualization source
 */
define([
            'jquery',
            'underscore',
            'vizapi/SplunkVisualizationBase',
            'vizapi/SplunkVisualizationUtils',
            'd3',
            '3d-force-graph',
            'force-graph'
            // Add required assets to this list
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3,
            ForceGraph3D,
            ForceGraph
        ) {

    var MAX_EDGE_SZ = 18; // 18px

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
            this.graph3d = null;
            this.initialized = false;
            this.disableDagMode = false;

            this.$el = $(this.el);
            this.uuid = this._getUUID();
            // this.$el.css('id','viz_base')
            this.$el.append('<div class="graphviz-container" name="3d' + this.uuid + '"></div>');
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
                var showAnimationBar = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('showAnimationBar', config));

                this._toggleAnimationBar(showAnimationBar);

            } else {
              // Re-rendering the viz to apply config changes
              this.invalidateUpdateView();
            }
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
                  var id = row[ix],
                      name = id;
                      // name = fields[ix].name + ": " + id;

                  if (!nodeIds.has(id)){
                    var newNode = {
                        "id": id,
                        "name": name,
                        "val": 1,
                        "has_custom_color": 0,
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
              }
            };
        },

        // Implement updateView to render a visualization.
        //  'data' will be the data object returned from formatData or from the search
        //  'config' will be the configuration property object
        updateView: function(data, config) {
            if (this.logging) console.log("updateView() - Entering");

            // check for data
            if (!data || data.content.nodes.length < 1) {
                if(this.logging) console.log('updateView() - Error: no data');
                return;
            }

            var $elem = $('div.graphviz-container[name=' + this.uuid + ']'),
                $elem3d = $('div.graphviz-container[name=3d' + this.uuid + ']');

            var that = this;
            var enable3D = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('enable3D', config));
            var showAnimationBar = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('showAnimationBar', config));
            var params = {
              "bgColor": this._getEscapedProperty('bgColor', config) || '#000011',
              "dagMode": this._normalizeNull(this._getEscapedProperty('dagMode', config) || 'null'),
              "lkColor": this._getEscapedProperty('lkColor', config) || '#ffffff',
              "ndColor": this._getEscapedProperty('ndColor', config) || '#EDCBB1',
              "cameraController": this._getEscapedProperty('cameraController', config) || 'trackball'
            };
            this.useDrilldown = this._isEnabledDrilldown(config);

            // Show/Hide Animation Bar
            this._toggleAnimationBar(showAnimationBar);
            
            if (!this.initialized) {
                if (this.logging) console.log("updateView() - Initializing graphs");
                // Load graphs
                this._load3DGraph($elem3d.get(0), params);
                this._load2DGraph($elem.get(0), params);
                // Render graphs
                this.graph3d($elem3d.get(0)).graphData(data.content);
                this.graph($elem.get(0)).graphData(data.content);

                this.initialized = true;
            } else {
                if (this.logging) console.log("updateView() - Refreshing graphs");
                var graph = (enable3D) ? this.graph3d : this.graph;
                graph.linkColor(link => link.color = link.has_custom_color < 1 ? params['lkColor'] : link.color)
                    .nodeColor(node => node.color =
                        node.has_custom_color < 1 ? params['ndColor'] : node.color)
                    .backgroundColor(params["bgColor"])
                    .dagMode(params["dagMode"]);
            }

            // Display only one graph
            if (enable3D) {
              $elem.addClass("hide");
              $elem3d.removeClass("hide");
            } else {
              $elem3d.addClass("hide");
              $elem.removeClass("hide");
            }
        },

        // Search data params
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 0
            });
        },

        _load2DGraph: function(elem, params){
          var that = this;

          this.graph = ForceGraph.default()(elem)
              .backgroundColor(params['bgColor'])
              .linkWidth(link => link.width > MAX_EDGE_SZ ? MAX_EDGE_SZ : link.width)
              .dagMode(params['dagMode'])
              .onNodeHover(node => {
                // Change cursor when hovering on nodes (if drilldown enabled)
                elem.style.cursor = node && that.useDrilldown ? 'pointer' : null;
              })
              .linkDirectionalArrowLength(3.5)
              .linkDirectionalArrowRelPos(1)
              .onNodeClick(that._drilldown.bind(that));
        },

        _load3DGraph: function(elem, params){
            const distance = 1000;
            var that = this;

            this.graph3d = ForceGraph3D.default({ controlType: params['cameraController'] })(elem)
              .cameraPosition({ z: distance })
              .onNodeHover(node => {
                // Change cursor when hovering on nodes (if drilldown enabled)
                elem.style.cursor = node && that.useDrilldown ? 'pointer' : null;
              })
              .onNodeClick(that._drilldown.bind(that))
              .backgroundColor(params['bgColor'])
              .linkWidth(link => link.width > MAX_EDGE_SZ ? MAX_EDGE_SZ : link.width)
              .linkDirectionalArrowLength(3.5)
              .linkDirectionalArrowRelPos(1)
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
            var graph = (enable3D) ? this.graph3d : this.graph;

            if (enable3D) {
                resumeAnimation ? graph.resumeAnimation() : graph.pauseAnimation();
                return;
            }

            // Handle Animation for 2D Graph
            if (!resumeAnimation) {
                graph.pauseAnimation();
                graph.enableZoomPanInteraction(false);

                // Work-around a library misbehaviour
                var max = 2,
                    cnt = 0,
                    id = setInterval(() => {
                      while(cnt < max) {
                        graph.resumeAnimation();
                        graph.pauseAnimation();
                        cnt = cnt + 1;
                      }
                      clearInterval(id);
                    }, 50);
                return;
            }

            // Work-around a library misbehaviour
            graph.pauseAnimation();
            graph.resumeAnimation();
            graph.enableZoomPanInteraction(true);
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
