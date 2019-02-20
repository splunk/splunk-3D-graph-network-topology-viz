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

    // Extend from SplunkVisualizationBase
    return SplunkVisualizationBase.extend({

        initialize: function() {
            this.logging = false;
            if(this.logging) console.log('initialize() - Entered');

            SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
            this.graph = null;
            this.graph3d = null;
            this.hasCanvasChanged = false;

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

            var curr_config = this.getCurrentConfig();
            var key_tokens = Object.keys(config)[0].split(/[\s.]+/);

            this.hasCanvasChanged = ('enable3D') === key_tokens[key_tokens.length-1];

            if ('showAnimationBar' === key_tokens[key_tokens.length-1]){
                var showAnimationBar = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('showAnimationBar', config));

                this._toggleAnimationBar(showAnimationBar);

            } else {
              // Re-rendering the viz to apply config changes
              this.invalidateReflow();
            }
        },

        // Optionally implement to format data returned from search.
        // The returned object will be passed to updateView as 'data'
        formatData: function(data) {
            if(this.logging) console.log('formatData() - Entered');
            // Expects:
            // <search> | stats count by src dst

            var fields = data.fields;
            var rows = data.rows;
            var nodes = [],
                links = [],
                indexColor = -1,
                indexSize = -1;

            if (rows.length < 1 && fields.length < 1) {
                return false;
            }

            // Extra customisation fields given
            if (fields.length > 3) {
                if(this.logging) console.log('formatData() - Got extra customisation fields');

                // Assumption: colors are consecutive as well as size/weight
                indexColor = fields.findIndex(obj => obj.name === "color");
                var indexColorDst = indexColor +1;

                indexSize = fields.findIndex(obj => obj.name === "weight");
                var indexSizeDst = indexSize +1;
            }

            // Avoid duplicates!
            let node_ids = new Set();

            _.each(rows, function(row) {
                // Iterating over 0-1 to get row columns
                _.each([...Array(2).keys()], function(ix) {
                  var id = row[ix],
                      name = id;
                      // name = fields[ix].name + ": " + id;

                  if (!node_ids.has(id)){
                    var new_node = {
                      "id": id,
                      "name": name,
                      "val": 1,
                    };
                    if (indexColor > 0) new_node["color"] = (ix < 1) ? row[indexColor] : row[indexColorDst];
                    if (indexSize > 0) new_node["val"] = (ix < 1) ? row[indexSize] : row[indexSizeDst];

                    nodes.push(new_node);
                    node_ids.add(id);
                  }
                });

                var new_link = {
                  "source": row[0],
                  "target": row[1]
                };
                links.push(new_link);
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
              "dagMode": this._getEscapedProperty('dagMode', config) || 'null',
              "cameraController": this._getEscapedProperty('cameraController', config) || 'trackball'
            };
            this.useDrilldown = this._isEnabledDrilldown(config);

            // Show/Hide Animation Bar
            this._toggleAnimationBar(showAnimationBar);

            // Load graphs
            this._load3DGraph($elem3d.get(0), params);
            this._load2DGraph($elem.get(0), params);

            // Render graphs
            this.graph3d($elem3d.get(0)).graphData(data.content);
            this.graph($elem.get(0)).graphData(data.content);

            // Display only one graph
            if (enable3D) {
              $elem.addClass("hide");
            } else {
              $elem3d.addClass("hide");
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

          this.graph = ForceGraph()(elem)
              .backgroundColor(params['bgColor'])
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

            this.graph3d = ForceGraph3D({ controlType: params['cameraController'] })(elem)
              .cameraPosition({ z: distance })
              .onNodeHover(node => {
                // Change cursor when hovering on nodes (if drilldown enabled)
                elem.style.cursor = node && that.useDrilldown ? 'pointer' : null;
              })
              .onNodeClick(that._drilldown.bind(that))
              .backgroundColor(params['bgColor'])
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

            resumeAnimation ? graph.resumeAnimation() : graph.pauseAnimation();
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

        // Override to respond to re-sizing events
        reflow: function() {
            if(this.logging) console.log('reflow() - size this.el ('+this.$el.width()+','+this.$el.height()+')');

            if (null == this.graph && null == this.graph3d) {
              if(this.logging) console.log('reflow() - Not initialised yet. Skipping.');
              return;
            }

            var config = this.getCurrentConfig();

            var width = this.$el.width(),
                height = this.$el.height();

            var $elem = $('div.graphviz-container[name=' + this.uuid + ']'),
                $elem3d = $('div.graphviz-container[name=3d' + this.uuid + ']');

            var enable3D = SplunkVisualizationUtils.normalizeBoolean(this._getEscapedProperty('enable3D', config));
            var params = {
              "bgColor": this._getEscapedProperty('bgColor', config) || '#000011',
              "dagMode": this._getEscapedProperty('dagMode', config) || 'null',
              "cameraController": this._getEscapedProperty('cameraController', config) || 'trackball'
            }

            if (enable3D){
                if(this.logging) console.log("reflow() - updating 3D graph");

                this._load3DGraph($elem3d.get(0), params);
                this.graph3d.width(width)
                    .height(height)
                    .graphData(this.getCurrentData().content);

            } else {
                if(this.logging) console.log("reflow() - updating 2D graph");

                // No need to re-load the graph w/ 2D Canvas
                this.graph.width(width)
                    .height(height)
                    .backgroundColor(params["bgColor"])
                    .dagMode(params["dagMode"]);
            }

            // Swap canvas display if changed
            if (this.hasCanvasChanged) {
                $elem.toggleClass("hide");
                $elem3d.toggleClass("hide");
            }
        }
    });
});
