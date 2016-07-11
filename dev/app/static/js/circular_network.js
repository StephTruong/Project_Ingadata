var CircularNetwork = function module() {

    var opts = {
        width: 200,
        height: 200,
        margins: {top:30, right:30, bottom:30, left:30},
        fillColorList: [
            "#3182bd", "#6baed6", "#9ecae1", "#c6dbef",
            "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
            "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
            "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
            "#636363", "#969696", "#bdbdbd", "#d9d9d9"
        ],
        enableTooltips: true,
        enableBringToFront: true,
        labelOffset: 5
    };

    function exports(_selection) {
        _selection.each(function (_dataset) {

            //________________________________________________
            // Data
            //________________________________________________
            var dataset = d3.transpose(_dataset);
            var start = dataset[0];
            var end = dataset[1];
            var weight = (dataset[2] == undefined)
                ? start.map(function(d, i){return 1;})
                : dataset[2].map(function(d){return parseInt(d);});

            //________________________________________________
            // Data transform
            //________________________________________________
            var transformedData = d3.transpose([start, end, weight]);

            // list of unique values to use as index
            var unique = [];
            transformedData.forEach(function(d, i){
                if(unique.indexOf(d[0]) == -1) unique.push(d[0]);
                if(unique.indexOf(d[1]) == -1) unique.push(d[1]);
            });

            // init square matrix
            var matrix = d3.range(unique.length).map(function(){
                return d3.range(unique.length).map(function(){return 0;});
            });

            // compute matrix
            transformedData.forEach(function(d, i){
                var row = unique.indexOf(d[1]);
                var col = unique.indexOf(d[0]);
                matrix[col][row] = d[2];
            });

            //________________________________________________
            // DOM selection
            //________________________________________________
            var chartW = Math.max(opts.width - opts.margins.left - opts.margins.right, 0.1);
            var chartH = Math.max(opts.height - opts.margins.top - opts.margins.bottom, 0.1);

            var svg = d3.select(this).selectAll("svg").data([0]);
            svg.enter().append("svg").attr({width: opts.width, height: opts.height})
                .append("g").attr({class: "vis-group",
                transform: "translate(" + (opts.margins.left + chartW/2) + "," + (opts.margins.top + chartH/2) + ")"});
            var chartSVG = d3.select("g.vis-group");

            //________________________________________________
            // Circular network
            //________________________________________________
            var fill = function(i) {
                return opts.fillColorList[i % opts.fillColorList.length];
            }
            var chord = d3.layout.chord().padding(.05).matrix(matrix);
            var r1 = Math.min(chartW, chartH) / 2;
            var r0 = r1 * 0.9;

            // draw arcs
            var groupSVG = chartSVG.selectAll("path.arc")
                .data(chord.groups);
            groupSVG.enter().append("path")
                .attr("class", "arc")
            groupSVG.attr("d", d3.svg.arc()
                .innerRadius(r0)
                .outerRadius(r1))
                .style("fill", function(d){ return fill(d.index);});
            groupSVG.exit().remove();

            // draw chords
            var chordSVG = chartSVG.selectAll("path.link")
                .data(chord.chords);
            chordSVG.enter()
                .append("path")
                .attr("class", "link")
                .call(highlight);
            chordSVG.attr("d", d3.svg.chord().radius(r0))
                .style("fill",function (d) {return fill(d.target.index);});
            chordSVG.exit().remove();
            if(opts.enableBringToFront) chordSVG.call(bringToFront);

            function highlight(_selection){
                _selection
                    .on("mouseover.highlight", function(d, i) {
                        d3.select(this).classed({highlighted: true});
                    })
                    .on("mouseout.highlight", function(d, i){
                        d3.select(this).classed({highlighted: false});
                    });
            }

            function bringToFront(_selection){
                _selection.on("mouseover.toFront", function() {
                        var dragTarget = event.target;
                        dragTarget.parentNode.appendChild( dragTarget );
                    });
            }

            //________________________________________________
            // Labels
            //________________________________________________
            var labelSVG = chartSVG.selectAll("text.label")
                .data(chord.groups);
            labelSVG.enter().append("text")
                .attr("class", "label");
            labelSVG.each(function(d){ d.angle = (d.startAngle + d.endAngle) / 2; })
                .attr("text-anchor", function(d){ return d.angle > Math.PI ? "end" : null; })
                .attr("transform", function(d){
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                        + "translate(" + (r1 + opts.labelOffset) + ")"
                        + (d.angle > Math.PI ? "rotate(180)" : "");
                })
                .text(function(d, i){ return unique[i];});
            labelSVG.exit().remove();

            //________________________________________________
            // Tooltips
            //________________________________________________
            if(opts.enableTooltips){
                var groupTooltip = tooltip()
                    .accessor(function(d, i){
                        return "<strong>start</strong>: " + unique[i]; });

                var chordTooltip = tooltip()
                    .accessor(function(d, i){
                        var tipText = "<strong>start</strong>: " + unique[d.source.index] + "<br/> "
                            + "<strong>weight</strong>: " + d.source.value + "<br/> "
                            + "to<br/>"
                            + "<strong>end</strong>: " + unique[d.target.index] + "<br/>"
                            + "<strong>weight</strong>: " + d.target.value;
                        return tipText;
                    });

                groupSVG.call(groupTooltip);
                chordSVG.call(chordTooltip);
            }

        });
    }

    exports.opts = opts;
    createAccessors(exports);

    return exports;
};


var tooltip = function module(){
    var opts = {
        accessor: function(d, i){return d;}
    };
    function exports(selection){
        var tooltipDiv;
        var body = d3.select("body");
        selection.on("mouseover.tooltip", function(d, i){
                d3.select("body").selectAll("div.tooltip").remove();
                tooltipDiv = body.append("div").attr("class", "tooltip");
                var absoluteMousePos = d3.mouse(body.node());
                tooltipDiv.style("left", (absoluteMousePos[0] + 10)+"px")
                    .style("top", (absoluteMousePos[1] - 15)+"px")
                    .style("position", "absolute")
                    .style("z-index", 1001);
                var tooltipText = opts.accessor(d, i) || "";
                tooltipDiv.html(tooltipText);
            })
            .on("mousemove.tooltip", function(d, i) {
                var absoluteMousePos = d3.mouse(body.node());
                tooltipDiv.style("left", (absoluteMousePos[0] + 10)+"px")
                    .style("top", (absoluteMousePos[1] - 15)+"px");
            })
            .on("mouseout.tooltip", function(d, i){
                tooltipDiv.remove();
            });

    };
    exports.opts = opts;
    createAccessors(exports);
    return exports;
};

function createAccessors(visExport) {
    for (var n in visExport.opts) {
        if (!visExport.opts.hasOwnProperty(n)) continue;
        visExport[n] = (function(n) {
            return function(v) {
                return arguments.length ? (visExport.opts[n] = v, this) : visExport.opts[n];
            }
        })(n);
    }
};