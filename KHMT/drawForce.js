function draw_forceLayout(source) {
    // Load data for Force Layout from file "data-force.js"
    d3.select("body").insert("script").attr("src", "data-force.js");
    // Hide Tree Layout and display Force Layout
    var treeLayout_height = parseInt(d3.select("#treeLayout").style("height"));
    var treeLayout_width = parseInt(d3.select("#treeLayout").style("width"));
    d3.select("#treeLayout")
        .attr("visibility", "hidden")
        .attr("height", 0)
        .attr("width", 0);
    d3.select("#back").style("visibility", "visible")
        .on("click", function() { // When click back button, remove Force Layout and display Tree Layout again
            d3.select("#back").style("visibility", "hidden");
            d3.select("#treeLayout")
                .attr("visibility", "visible")
                .attr("height", treeLayout_height)
                .attr("width", treeLayout_width);
            d3.select("#forceLayout").remove();
        });

    //Data for edges of the graph  
    var nodes = {};
    var width = 1400,
        height = 1000;
    var svg = d3.select("body").insert("svg", "#treeLayout")
        .attr("id", "forceLayout")
        .attr("width", width)
        .attr("height", height);

    // Create all nodes from source and target of links
    // nodes["name of subject"] = {name: "name of subject"}
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
        link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    });

    var force = d3.layout.force() // Initialize d3 force layout
        .nodes(d3.values(nodes)) // Each node becomes a vertex of graph
        .links(links) // Each link is an edge
        .size([width, height]) // Size of graph
        .linkDistance(100) // Length of each edge
        .gravity(0.07)
        .charge(-400); // Distance between two vertices, negative number means two vertices push each other

    force.start(); // Start calculating

    // Binding edge data and append into HTML
    var link = svg.append("g")
        .selectAll("path")
        .data(force.links())
        .enter().append("path")
        .attr("class", function(d) { //Add class
            return "force_link " + "type" + d.type;
        })
        .attr("marker-end", function(d) { //Add arrow head
            return "url(#arrowHead" + d.type + ")";
        })
        .attr("d", function(d) { //Draw edge
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        });

    // Binding node data
    var node = svg.append("g").selectAll("g.node")
        .data(force.nodes());

    var drag = force.drag() // Stick node at new position when drag
        .on("dragstart", function(d) {
            d.fixed = true;
        });

    var newNode = node.enter().append("g")
        .attr("class", "force_node")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .call(drag); // Callback drag

    // For each node, append <path> and <text> into HTML
    newNode.append("path");
    newNode.append("text");

    newNode.select("path")
        .attr("d", d3.svg.symbol() // Style node
            .size(150)
            .type("circle"))
        .attr("transform", function(d) { // Display
            return "translate(" + d.x + "," + d.y + ")";
        });

    newNode.select("text")
        .attr("x", 10)
        .attr("dy", "0.5em") // Style text
        .text(function(d) {
            return d.name;
        })
        .attr("transform", function(d) { // Display
            return "translate(" + d.x + "," + d.y + ")";
        });

    force.on('tick', function() { // On each tick when the force is calculating, display its temporary position
        link.attr("d", function(d) { // Draw edge
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        });
        newNode.select("path").attr("transform", function(d) { // Display circle
            return "translate(" + d.x + "," + d.y + ")";
        });
        newNode.select("text").attr("transform", function(d) { // Display text
            return "translate(" + d.x + "," + d.y + ")";
        });
    });

    // Highlight node which is called by double clicking in the Tree Layout
    d3.selectAll(".force_node").filter(function(d) {
            return d.name == source.name;
        })
        .select("path")
        .transition()
        .duration(500)
        .style("fill", "#9b59b6")
        .style("stroke", "#8e44ad")
        .attr("d", d3.svg.symbol()
            .size(400)
            .type("circle"));
    d3.selectAll(".force_node").filter(function(d) {
            return d.name == source.name;
        })
        .select("text")
        .style("fill", "#8e44ad")
        .style("font-weight", "bold")
        .style("font-size", "17px");

    // Show tooltip contains additional information on mouseover
    function mouseover(d) {
        force.stop();
        // Highlight node
        d3.select(this).select("path").transition()
            .duration(500)
            .style("fill", "#9b59b6")
            .style("stroke", "#8e44ad")
            .attr("d", d3.svg.symbol()
                .size(400)
                .type("circle"));

        tooltip.style("visibility", "visible").html(function() { //Display tooltip to show information 
            return "<strong>Tên môn học: </strong><span style='color: #D2FBC2; font-weight: bold'>" + d.name + "</span><br>"
        });

        // Highlight text
        d3.select(this).select("text")
            .style("fill", "#8e44ad")
            .style("font-weight", "bold")
            .style("font-size", "17px");
    }
    // Move tooltip along cursor
    function mousemove(d) {
        tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    }
    // Hide tootip
    function mouseout(d) {
        // Remove highlight of this node
        d3.select(this).select("path").transition()
            .duration(500)
            .style("fill", "#ccc")
            .style("stroke", "#333")
            .attr("d", d3.svg.symbol()
                .size(150)
                .type("circle"));

        d3.select(this).select("text")
            .style("fill", "black")
            .style("font-weight", "normal")
            .style("font-size", "14px");
        tooltip.style("visibility", "hidden");
        force.start();
    }
}
