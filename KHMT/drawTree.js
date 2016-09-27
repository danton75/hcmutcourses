// Declare size of the graph
var margin = { top: 20, right: 50, bottom: 20, left: 200 },
    width = 1400 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var i = 0,
    opened = 0,
    duration = 500,
    root = data; // Access data from file data-tree.js
root.x0 = height / 2;
root.y0 = 0;

// Create tree with d3
var tree = d3.layout.tree()
    .size([height, width]);

// Append svg for graphic
var svg = d3.select("body").append("svg") //Append tag svg to body <svg>
    .attr("id", "treeLayout")
    .attr("width", width + margin.right + margin.left) //<svg width = "">
    .attr("height", height + margin.top + margin.bottom) //<svg width = "" height = "">
    .append("g") //Append tag <g> into tag <svg>
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // <g transform = "translate( , )">

// Tooltip for highlight and show information
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tool-tip");

// Draw a diagonal to position d.x, d.y
var diagonal = d3.svg.diagonal()
    .projection(function(d) {
        return [d.y, d.x];
    })
// Collapse all children node at the beginning
function closeNode(d) {
    if (d.children) {
        d._children = d.children; //If d has children, then all children of d is hidden; d._children is private
        d._children.forEach(closeNode); //Each children of d's children is hidden too
        d.children = null;
    }
}

root.children.forEach(closeNode);
update(root);

function update(source) {
    // Compute the new tree layout.
    // The nodes() function in d3 produces which is a SET of nodes, each of which has a set of characteristics
    /*
    nodes [
      {
        "name": "node1"
        "children": [child nodes]
        "depth":
        "id":
        "parent":
        "x":
        "y":
      },
      ...
    ];
    */
    var nodes = tree.nodes(root).reverse(), //nodes = d3.layout.tree().size([height, width]).nodes(root).reverse();
        //From this node data a set of links joining the nodes is created. Each link consists of a .source and .target. 
        //Each of which is a node.
        links = tree.links(nodes);

    // Calculate depth for each nodes
    nodes.forEach(function(d) {
        if (d.depth === 4) {
            d.y = (d.depth - 1) * 180 + 400;
        } else {
            d.y = d.depth * 180;
        }
    });

    // Update the nodes…
    // https://bost.ocks.org/mike/join/
    // Join each <g class="node"> with a nodes[i]
    var node = svg.selectAll("g.node") //Select all tag <g> of svg with class = "node"
        .data(nodes, function(d) { //Binding data to variable node, each node is bound to an element of nodes with key id
            return d.id || (d.id = ++i);
        });

    // Enter any new nodes at the parent's previous position.
    var newNode = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .on("dblclick", dblclick);

    newNode.append("path");
    newNode.append("text");

    newNode.select("path")
        .attr("d", d3.svg.symbol().size(0)  // Hide at first
            .type(function(d) {     // If node is a subject, then display diamond shape. Otherwise, display circle shape
                if (d.depth < 3) {
                    return "circle";
                } else {
                    return "diamond";
                }
            }))
        .style("fill", function(d) {
            return d._children ? d.color_nodeFill : "#fff";
        })
        .style("stroke", function(d) {
            return d.color_nodeStroke;
        });

    newNode.select("text")
        .style("fill", function(d) {
            return d.color_nodeStroke;
        })
        .style("fill-opacity", 0)
        .attr("x", function(d) {
            return d.children || d._children ? -10 : 10;
        })
        .attr("dy", function(d) {
            return d.children || d._children ? "-0.35em" : "0.35em";
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function(d) {
            return d.name;
        });

    /* Each node
      <g class = "node" transform = "translate(y, x)">
        <circle r="1e-6" style="fill: lightsteelblue || #fff"></circle>
        <text x="-10 || 10" dy=".35em" text-anchor="end || start" style="fill-opacity: 1e-6">d.name</text>
      </g>
    */

    // Transition nodes to their new position.
    var update_newNode = node.transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    update_newNode.select("path")
        .attr("d", d3.svg.symbol()
            .size(80)
            .type(function(d) {
                if (d.depth < 3) {
                    return "circle";
                } else if (d.depth >= 3) {
                    return "diamond";
                }
            }))
        .style("fill", function(d) {
            return d._children ? d.color_nodeFill : "#fff";
        });

    update_newNode.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeRemove = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    nodeRemove.select("path")
        .attr("d", d3.svg.symbol()
            .size(0)
            .type(function(d) {
                if (d.depth < 3) {
                    return "circle";
                } else if (d.depth >= 3) {
                    return "diamond";
                }
            }));

    nodeRemove.select("text")
        .style("fill-opacity", 0);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { //Binding each link with its target id
            return d.target.id;
        });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var t = { x: source.x0, y: source.y0 };
            return diagonal({ source: t, target: t });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var t = { x: source.x, y: source.y };
            return diagonal({ source: t, target: t });
        })
        .remove();

    // Save the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        //Dynamic resize
        if (d.depth === 2) {
            if (--opened >= 3) {
                height -= 200;
                d3.select("svg").attr("height", height + margin.top + margin.bottom);
                tree = d3.layout.tree().size([height, width]);
            }
        }
        //Toggle children of d
        d._children = d.children;
        d.children = null;
    } else {
        //Dynamic resize
        if (d.depth === 2) {
            if (++opened > 3) {
                height += 200;
                d3.select("svg").attr("height", height + margin.top + margin.bottom);
                tree = d3.layout.tree().size([height, width]);
            }
        }
        //Toggle children of d
        d.children = d._children;
        d._children = null;
    }
    update(d);
}
// Show tooltip contains additional information on mouseover
function mouseover(d) {
    if (d.code) {
        //Highlight node
        d3.select(this).select("path").transition()
            .duration(duration)
            .style("fill", "#9b59b6")
            .style("stroke", "#8e44ad")
            .attr("d", d3.svg.symbol()
                .size(200)
                .type(function(d) {
                    if (d.depth < 3) {
                        return "circle";
                    } else if (d.depth >= 3) {
                        return "diamond";
                    }
                }));
        tooltip.style("visibility", "visible").html(function() { //Display tooltip to show information about 
            return "<strong>Tên môn học: </strong><span style='color: #D2FBC2; font-weight: bold'>" + d.name + "</span><br>" +
                "<strong>Mã môn học: </strong><span style='color: #D2FBC2; font-weight: bold'>" + d.code + "</span><br>" +
                "<strong>Số tín chỉ: </strong><span style='color: #D2FBC2; font-weight: bold'>" + d.credit + "</span><br>"
        });
        //Highlight text
        d3.select(this).select("text")
            .style("fill", "#8e44ad");
        //Traceback to highlight path from root to node
        var temp = d;
        while (temp) {
            //Select link from parent to this node
            var link = d3.selectAll("path.link").filter(function(p) {
                return p.target.id == temp.id;
            });
            //Select parent node
            var node = d3.selectAll(".node").filter(function(p) {
                return p == temp.parent;
            });
            //Highlight parent node's symbol
            node.select("path").transition()
                .duration(duration)
                .style("fill", "#9b59b6")
                .style("stroke", "#8e44ad")
                .attr("d", d3.svg.symbol()
                    .size(200)
                    .type(function(d) {
                        if (d.depth < 3) {
                            return "circle";
                        } else if (d.depth >= 3) {
                            return "diamond";
                        }
                    }));
            //Highlight parent node's text
            node.select("text")
                .style("fill", "#8e44ad");
            //Highlight link
            link.style("stroke", "#8e44ad")
                .style("stroke-width", "3px");
            //Traceback to until root
            temp = temp.parent;
        }
    } else {
        tooltip.style("visibility", "hidden");
    }
}
// Move tooltip along cursor
function mousemove(d) {
    tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
}
// Hide tootip
function mouseout(d) {
    //Remove highlight of this node
    d3.select(this).select("path").transition()
        .duration(duration)
        .style("fill", function(d) {
            return d._children ? d.color_nodeFill : "#fff";
        })
        .style("stroke", function(d) {
            return d.color_nodeStroke;
        })
        .attr("d", d3.svg.symbol()
            .size(80)
            .type(function(d) {
                if (d.depth < 3) {
                    return "circle";
                } else if (d.depth >= 3) {
                    return "diamond";
                }
            }));

    d3.select(this).select("text")
        .style("fill", function(d) {
            return d.color_nodeStroke;
        })
        //Traceback to remove highlight path from root to node
    var temp = d;
    while (temp) {
        //Select link from parent to this node
        var link = d3.selectAll("path.link").filter(function(p) {
            return p.target.id == temp.id;
        });
        //Select parent node
        var node = d3.selectAll(".node").filter(function(p) {
            return p == temp.parent;
        });
        //Remove highlight parent node's symbol
        node.select("path").transition()
            .duration(duration)
            .style("fill", function(d) {
                return d._children ? d.color_nodeFill : "#fff";
            })
            .style("stroke", function(d) {
                return d.color_nodeStroke;
            })
            .attr("d", d3.svg.symbol()
                .size(80)
                .type(function(d) {
                    if (d.depth < 3) {
                        return "circle";
                    } else if (d.depth >= 3) {
                        return "diamond";
                    }
                }));
        //Remove highlight parent node's text
        node.select("text")
            .style("fill", function(d) {
                return d.color_nodeStroke;
            });
        //Remove highlight link
        link.style("stroke", "#3498db")
            .style("stroke-width", "1px");
        //Traceback until root
        temp = temp.parent;
    }
    tooltip.style("visibility", "hidden");
}
//
function dblclick(d) {
    tooltip.style("visibility", "hidden");
    if (d.code) {
        draw_forceLayout(d);
    }
}