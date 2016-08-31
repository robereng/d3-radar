/**
 * d3Radar.js v1.0.0
 * Rob Reng - Sets up the radar  - draws radar, axis, labels and legend, and gathers the data for the nodes
 * Copyright 2013
 */
var d3Radar = (function(){

  var width = 1400, height = 1000, radius = 400;

  var center = {"x":width/2, "y":height/2};

  nodeRadius = 10;
  
  var svgWrapper, legend;

  var grey = d3.scale.ordinal().range(["#ddd", "#e4e4e4", "#e9e9e9", "#eee"]);
  var color = d3.scale.ordinal().range(["#ed008c", "#fa9d1c", "#e31e27", "#ae016d", "#00a59e"]);

  init();

  function init(){

    svgWrapper = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

    getSecureApiClient().radarNodesGet()
    .then(function(result){
      var stageArray = ["adopt", "trial", "assess", "hold"]; 
      var typeArray = ["technique", "platform", "tool", "language-framework"];

      drawTypeLabels(typeArray);
      drawLegend();
      prepareNodes(stageArray, typeArray, result.data);
      drawAxis();

      $("button[data-modal='modal-1']").on('click', function(e) {
        $.get("/create", function(data) { 
            $(".createBlock").html(data);
            ModalEffects.openModalTrigger(e.target || e.srcElement);
            d3Radar.createForm.init();
        });  
      });

      $("button[data-modal='modal-2']").on('click', function(e) {
        $.get("/edit?id="+$(".popup #id").text(), function(data) { 
            $('.md-content h3', data).text('Edit Technology')
            $(".createBlock").html(data);
            $(".popup").removeClass('md-show');
            ModalEffects.openModalTrigger(e.target || e.srcElement);
            d3Radar.editForm.init();
        });  
      });
    }).catch( function(result){
        console.log('error retrieving json from AWS Gateway')
    });

  }

  // --- Add for updating --- 
  function getSecureApiClient() {

    return apigClientFactory.newClient({
        region: 'us-east-1', // Set to your region
        accessKey: 'YOUR ACCESS TOKEN', // Set to your access key
        secretKey: 'YOUR SECRET' // Set to your secret
    });
  }

  function drawTypeLabels(typeArray) {

    for(var l = 0; l < typeArray.length; l++){

      var outerPos = {'x': 0, 'y': 0};
      switch(l){
        case 2:
          outerPos.x = center.x - radius - radius/8;
          outerPos.y = center.y - radius;
          break;
        case 1:
          outerPos.x = center.x + radius;
          outerPos.y = center.y - radius;
          break;
        case 0:
          outerPos.x = center.x + radius;
          outerPos.y = center.y + radius;
          break;
        case 3:
          outerPos.x = center.x - radius - radius/8;;
          outerPos.y = center.y + radius;
          break;
      }

      var type = typeArray[typeArray.length - 1 - l];

      var typeLabel = svgWrapper.append("g")
        .attr("id", "label"+type)
        .attr("class", "type-label")
        .attr("data-type", type)
        .attr("transform", "translate(" + outerPos.x +", "+outerPos.y+")");

      typeLabel.append("text")
        .style("font-size", "20px")
        .attr("class", "type-text")
        .attr("fill", "#555")
        .text(typeArray[l]);
    }

  }

  function drawLegend(){
  
    legend = svgWrapper.append("g")
      .attr("class", "legend")
      .attr("transform",  "translate(10,20)")
      .attr("height", 100)
      .attr("width", 100);
  }

  function prepareNodes(stageArray, typeArray, allNodes){

    var dataArray = Array();
    var groupPos = {'x': 0, 'y': 0};
    var internalRadius = radius;
    var angle = 0 + Math.PI/4;
    for(var j = 0; j < stageArray.length; j++){

      var stage = stageArray[stageArray.length - 1 - j];
      svgGroup = svgWrapper.append("g").attr('class', 'stage ' + stage + '');
      svgGroup.append('circle').attr("data-stage", stage).attr("class", "background").attr("r", internalRadius).attr("cx", center.x).attr("cy", center.y).attr("stroke", grey(stage)).attr("stroke-width", 100).attr("fill-opacity", 0.0);
      svgGroup.append('circle').attr("class", "dash").attr("r", internalRadius).attr("cx", center.x).attr("cy", center.y).attr("stroke", "#CCC").attr("stroke-width", 1).attr("fill-opacity", 0.0).attr("stroke-dasharray", "3,3");
      
      var placementX = center.x - internalRadius - 25;
      var placementY = center.y - 10;

      var stageLabel = svgGroup.append("g")
          .attr("id", "label"+stage)
          .attr("class", "stage-label")
          .attr("data-stage", stage)
          .attr("transform", "translate(" + placementX +", "+placementY+")");

      stageLabel.append("text")
          .style("font-size", "20px")
          .attr("class", "stage-text")
          .attr("fill", "#555")
          .text(stage);

      var circleRadius = 60;
      for(var k = 0; k < typeArray.length; k++){
        var type = typeArray[k];
        var newData = new Object();
        groupPos = getXY(center, internalRadius, angle);
        newData.y = groupPos.y;
        newData.x = groupPos.x;
        newData.stage = stage;
        newData.type = type;
        newData.nodes = Array();
        newData.angle = angle;
        newData.radius = internalRadius;
        newData.svgGroup = svgGroup;
        newData.layout = "force";
        for(var l = 0; l < allNodes.length; l++){
          var node = allNodes[l];
          if(node.stage == stage && node.type == type){
            node.id = l+1;
            newData.nodes.push(node);
          }
        }
        newData.summaryCount = newData.nodes.length - 1;
        dataArray.push(newData);
        angle += 2 * Math.PI/4;
      }
      angle = 0 + Math.PI/4;
      internalRadius -= 100;
    }
    $(dataArray).each(function(){
      d3Radar.force.applyForce(this, radius, center, svgWrapper, color, nodeRadius);
    });

    plotLegendNodes(allNodes);

  }

  function plotLegendNodes(allNodes){
    
    $(allNodes).each(function(i, d){

        var node = legend.append("g")
          .attr("data-id", d.id)
          .attr("class", "legendNode")
          .on("mouseover", mouseoverLegendNode)
          .on("mouseout", mouseoutLegendNode)
        
        node.append("circle")
          .attr("r", nodeRadius)
          .attr("cy", i * 25)
          .attr("cx", 10)
          .style("fill", color(d.type))
          .attr("stroke-width", "0");

        node.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .attr("y", i * 25)
          .attr("x", 10)
          .style("fill", "white")
          .text(d.id);

        node.append("text")
          .attr("dy", ".35em")
          .attr("y", i * 25)
          .attr("x", 25)
          .style("fill", "black")
          .text(d.name);
    });

  }

  function mouseoverLegendNode(d){
      d3.select(".node[data-id='"+$(this).attr('data-id')+"']").select("circle").transition().duration(300).attr("r", nodeRadius*2);
  }

  function mouseoutLegendNode(d){
    d3.select(".node[data-id='"+$(this).attr('data-id')+"']").select("circle").transition().duration(300).attr("r", nodeRadius);
  }

  function drawAxis() {
    var horizontal = svgWrapper.append("svg:line")
      .attr("x1", center.x - radius - radius/8)
      .attr("y1", center.y)
      .attr("x2", center.x + radius + radius/8)
      .attr("y2", center.y)
      .style("stroke", "rgb(255,255,255)")
      .style("stroke-width", 4);

    var vertical = svgWrapper.append("svg:line")
      .attr("x1", center.x)
      .attr("y1", center.y - radius - radius/8)
      .attr("x2", center.x)
      .attr("y2", center.y  + radius + radius/8)
      .style("stroke", "rgb(255,255,255)")
      .style("stroke-width", 4);
  }

  function getXY(center, radius, angle){
    x = center.x + radius * Math.sin(angle);
    y = center.y + radius * Math.cos(angle);
    var pos = {'x': 0, 'y': 0};
    pos.x = x;
    pos.y = y;
    return pos;
  }

  return {
    refreshCanvas: function () { 
      d3.select("svg")
       .remove();
      init();
    }
  }

})();