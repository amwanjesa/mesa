var NetworkModule = function (svg_width, svg_height) {

    // Create the svg tag:
    var svg_tag = "<svg id='NetworkModule_d3_custom' width='" + svg_width + "' height='" + svg_height + "' " +
        "style='border:1px dotted'></svg>";

    var locations = ["Work", "Beach", "Mall"];
    var day_periods = ["Morning", "Afternoon", "Evening", "Night"];

    createSelect = function (elementID, options) {
        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = elementID;

        //Create and append the options
        options.forEach(function (option) {
            var optionElem = document.createElement("option");
            optionElem.value = option;
            optionElem.text = option;
            selectList.appendChild(optionElem);
        })

        return selectList
    }

    var selectLocation = createSelect("location-select", locations)
    var selectTime = createSelect("time-select", day_periods)

    $("#elements")
        .append(selectLocation);
    $("#elements")
        .append(selectTime);

    // Append svg to #elements:
    $("#elements")
        .append($(svg_tag)[0]);

    var svg = d3.select("#NetworkModule_d3_custom")
    var width = +svg.attr("width")
    var height = +svg.attr("height")
    var g = svg.append("g")
        .classed("network_root", true)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.call(d3.zoom()
        .on("zoom", function () {
            g.attr("transform", d3.event.transform);
        }));

    var links = g.append("g")
        .attr("class", "links")

    var nodes = g.append("g")
        .attr("class", "nodes")



    this.render = function (data) {
        var graph = JSON.parse(JSON.stringify(data));

        simulation = d3.forceSimulation()
            .nodes(graph.nodes)
            .force("charge", d3.forceManyBody()
                .strength(-80)
                .distanceMin(2))
            .force("link", d3.forceLink(graph.edges))
            .force("center", d3.forceCenter())
            .stop();

        for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
        }

        var location = $("#location-select").val();
        var dayPeriod = $("#time-select").val();
        var initialColorKey = dayPeriod + "-" + location;
        links
            .selectAll("line")
            .data(graph.edges)
            .enter()
            .append("line")

        links
            .selectAll("line")
            .data(graph.edges)
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; })
            .attr("stroke-width", function (d) { return d.width; })
            .attr("stroke", function (d) { return d.color[initialColorKey]; });

        links
            .selectAll("line")
            .data(graph.edges)
            .exit()
            .remove();

        nodes
            .selectAll("circle")
            .data(graph.nodes)
            .enter()
            .append("circle")
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.tooltip)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        nodes.selectAll("circle")
            .data(graph.nodes)
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .attr("r", function (d) { return d.size; })
            .attr("fill", function (d) { return d.color[initialColorKey]; })

        $('#location-select').on('change', function () {
            var dayPeriod = $("#time-select").val();
            var colorKey = dayPeriod + "-" + this.value
            nodes.selectAll("circle")
                .data(graph.nodes)
                .attr("fill", function (d) { return d.color[colorKey]; })
            links
                .selectAll("line")
                .data(graph.edges)
                .attr("stroke", function (d) { return d.color[colorKey]; });
        });

        $('#time-select').on('change', function () {
            var location = $("#location-select").val();
            var colorKey = this.value + "-" + location
            nodes.selectAll("circle")
                .data(graph.nodes)
                .attr("fill", function (d) { return d.color[colorKey]; })
            links
                .selectAll("line")
                .data(graph.edges)
                .attr("stroke", function (d) { return d.color[colorKey]; });
        });

        nodes.selectAll("circle")
            .data(graph.nodes)
            .exit()
            .remove();
    };

    this.reset = function () {

    };
};
