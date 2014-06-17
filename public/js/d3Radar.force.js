/**
 * d3Radar.force.js v1.0.0
 * Rob Reng - applies force to the graph. Each node cluster is kept within the bounds of the corresponding segment
 * by the function getNearestXYPointInRange
 * Copyright 2013
 */
d3Radar.force = (function(){

  function applyForce(graph, radius, center, svgObj, color, nodeRadius){

    var popup, newFlags;

    var graphArea = graph.svgGroup.append("g").attr("class", graph.stage + "-" + graph.stage).attr("data-stage", graph.stage).attr("data-type", graph.type)
      .attr("transform", function(){
        var x = graph.x;
        var y = graph.y;
        return "translate(" + x + ", " + y + ")";
      });

    if(graph.nodes.length > 0){

      var force = d3.layout.force()
        .nodes(graph.nodes)
        .gravity(0.06)
        .charge(-100)
        .links([])
        .start();

      var node = graphArea.selectAll(".node")
        .data(graph.nodes)                
        .enter()
        .append("g")
        .attr("data-id", function(d){
          return d.id;
        })
        .attr("class", "node md-trigger")
        .attr("data-modal","modal-1")
        .on("mouseover", mouseoverNode)
        .on("mouseout", mouseoutNode)
        .on("click", clickNode)
        .attr("type", function(d){
          return d.type;
        })
        .attr("ownership", function(d){
          return d.stage;
        });

      node.append("circle")
        .attr("r", nodeRadius)
        .style("fill", function(d) {
          return color(d.type); 
        }).attr("stroke-width", "0");
                
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("fill", "white")
        .text(function(d) { return d.id;});

      force.on("tick", function(e) {

        graph.nodes.forEach(function(d,i){

          switch(graph.type)
          {
            case "technique":
              if(graph.x + d.x - nodeRadius < center.x){
                d.x = center.x - graph.x + nodeRadius;
              }
              if(graph.y + d.y - nodeRadius < center.y){
                d.y = center.y - graph.y + nodeRadius;
              }
            break;
            case "platform":
              if(graph.x + d.x - nodeRadius < center.x){
                d.x = center.x - graph.x + nodeRadius;
              }
              if(graph.y + d.y + nodeRadius > center.y){
                d.y = center.y - graph.y - nodeRadius;
              }
            break;
            case "tool":
              if(graph.x + d.x + nodeRadius > center.x){
                d.x = center.x - graph.x - nodeRadius;
              }
              if(graph.y + d.y + nodeRadius > center.y){
                d.y = center.y - graph.y - nodeRadius;
              }
            break;
            case "language-framework":
              if(graph.x + d.x + nodeRadius > center.x){
                d.x = center.x - graph.x - nodeRadius;
              }
              if(graph.y + d.y - nodeRadius < center.y){
                d.y = center.y - graph.y + nodeRadius;
              }
            break;

          }

          var xyDistanceToCenter = getXYDistanceBetweenTwoPoints(center.x, center.y, graph.x + d.x, graph.y + d.y);
          var bandRadiusOuter = graph.radius + radius/8;
          var bandRadiusInner = graph.radius - radius/8;
          
          if(xyDistanceToCenter > bandRadiusOuter - nodeRadius){
            var posOuter = getNearestXYPointInRange(graph.x + d.x, graph.y + d.y, bandRadiusOuter, xyDistanceToCenter, d.type, false);
            d.x = posOuter.x;
            d.y = posOuter.y;
          }
          // are we outside this bands range on the interior wall
          else if(xyDistanceToCenter < bandRadiusInner + nodeRadius){
            var posInner = getNearestXYPointInRange(graph.x + d.x, graph.y + d.y, bandRadiusInner, xyDistanceToCenter, d.type, true);
            d.x = posInner.x;
            d.y = posInner.y;
          }

        });
                
        node.attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")";});  

        if(e.alpha < 0.01){
          force.stop();
          drawFlags(graph);
        }

      });   

    }

    function mouseoverNode(d){

      d3.select(this).select("circle").transition().duration(300).attr("r", nodeRadius*2);

        //Get this bar's x/y values, then augment for the tooltip
      var xPosition = d.x + graph.x;
      var yPosition = d.y + graph.y;

      //Update the tooltip position and value
      d3.select(".tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .style("background-color", color(d.type))
        .style("color", "white")
        .select("#value")
        .text(d.name);

      //Show the tooltip
      d3.select(".tooltip").classed("hidden", false);

    }

    function mouseoutNode(){

      d3.select(this).select("circle").transition().duration(300).attr("r", nodeRadius);

      d3.select(".tooltip").classed("hidden", true);

    }

    function clickNode(d){

      var xPosition = d.x + graph.x;
      var yPosition = d.y + graph.y;

      d3.select(".popup")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#title")
        .text(d.name);

      d3.select(".popup")
        .select("#description")
        .text(d.description);

      d3.select(".popup")
        .select("#id")
        .text(d._id);

      ModalEffects.openModal($(".popup"));

    }

    function drawFlags(){

      var newNodes = Array();
      var now = new Date();

      for(var n = 0; n < graph.nodes.length; n++){
        var currentNode = graph.nodes[n];                 
        if(new Date(currentNode.date_added) > new Date(now.setDate(now.getDate()-1))){
          newNodes.push(currentNode);
        }
      }

      newFlags = svgObj.selectAll('g.new-flag-'+graph.type+'-'+graph.stage)
        .data(newNodes).enter().append('g').attr("class", "new-flag"+graph.type+'-'+graph.stage);

      var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");

      newFlags.append('path')
        .attr("d", function(d){
          var points = [
            {"x": d.x + graph.x, "y": d.y + graph.y - 50},
            {"x": d.x + graph.x + 60, "y": d.y + graph.y - 50},
            {"x": d.x + graph.x + 50, "y": d.y + graph.y - 40},
            {"x": d.x + graph.x + 60, "y": d.y + graph.y - 30},
            {"x": d.x + graph.x, "y": d.y + graph.y - 30},
            {"x": d.x + graph.x, "y": d.y + graph.y - 50}
          ];
          return lineFunction(points);
        }).attr("fill", "#cadb2b");


      newFlags.append('line')
        .attr("x1", function(d){
          return d.x + graph.x;
        }).attr("x2", function(d){
          return d.x + graph.x;
        }).attr("y1", function(d){
          return d.y + graph.y - 50;
        }).attr("y2", function(d){
          return d.y + graph.y - 8;
        }).attr("stroke", "white").attr("stroke-width", 3);

      newFlags.append('text')
        .text(function(d){
          return "NEW";
        })
        .attr("id", function(d){
          return d.id;
        })
        .attr("x", function(d){
          return d.x + graph.x + 5;
        })
        .attr("y", function(d){
          return d.y + graph.y - 34;
        }).attr("fill", "white").attr("font-weight", "bold");
    }

    function getXYDistanceBetweenTwoPoints(sourceX, sourceY, destinationX, destinationY){
      
        var xs = 0, ys = 0;
        xs = destinationX - sourceX;
        xs = xs * xs;

        ys = destinationY - sourceY;
        ys = ys * ys;

        return Math.sqrt(xs+ys);
    }
    function getNearestXYPointInRange(nodeX, nodeY, bandRadius, xyDistanceToCenter, type, outside){
      //find angle of line from node point to center.
      var diffx = nodeX - center.x;
      var diffy = nodeY - center.y;
      var nodeRads = Math.atan2(diffy, diffx);

      var newX = 0;
      var newY = 0;

      if(outside){
        newX = ((bandRadius + nodeRadius) * Math.cos(nodeRads)) + center.x;
        newY = ((bandRadius + nodeRadius) * Math.sin(nodeRads)) + center.y;
      }
      else{
        newX = ((bandRadius - nodeRadius) * Math.cos(nodeRads)) + center.x;
        newY = ((bandRadius - nodeRadius) * Math.sin(nodeRads)) + center.y;
      }

      var pos = {'x': newX - graph.x, 'y': newY - graph.y};
      return pos;
    }
  }  

  return {applyForce: applyForce}
})();
  