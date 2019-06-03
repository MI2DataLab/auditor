var points = options.points, smooth = options.smooth,
    xmin = options.xmin, xmax = options.xmax,
    ymin = options.ymin, ymax = options.ymax,
    n = options.n,
    yTitle = options.yTitle,
    xTitle = options.xTitle,
    chartTitle = options.chartTitle,
    background = options.background;

var plotHeight, plotWidth,
    margin = {top: 98, right: 30, bottom: 60+8, left: 60+8, inner: 70},
    h = height - margin.top - margin.bottom,
    plotTop = margin.top, plotLeft = margin.left;

var m = Math.ceil(n/2);
if (n == 2) { m = 2; }

if (options.scalePlot === true) {
  plotHeight = (h-(m-1)*margin.inner)/m;
  plotWidth = 3*plotHeight/2;
} else {
  plotHeight = 280;
  plotWidth = 420;
}

var k;
if (smooth === true) { k = 1; } else { k = 0; }
var modelNames = Object.keys(data[k]);

var colors = getColors(3, "point");
    pointColor = colors[k];
    smoothColor = colors[0];
    greyColor = colors[2];

autocorrelation(data);

svg.selectAll("text")
  .style('font-family', 'Fira Sans, sans-serif');

// plot function
function autocorrelation(data){
  var pointData = data[0], smoothData = data[1];
  for (var i=0; i<n; i++){
    var modelName = modelNames[i];
    singlePlot(modelName, pointData, smoothData, i+1);
  }
}

function singlePlot(modelName, pointData, smoothData, i) {

    var x = d3.scaleLinear()
          .range([plotLeft + 10, plotLeft + plotWidth - 10])
          .domain([xmin, xmax]);

    var y = d3.scaleLinear()
          .range([plotTop + plotHeight - 10, plotTop + 10])
          .domain([ymin, ymax]);

    // function to draw smooth lines
    var line = d3.line()
          .x(function(d) { return x(d.val); })
          .y(function(d) { return y(d.smooth); })
          .curve(d3.curveMonotoneX);

    // add plot things only once
    if (i==1) {
      svg.append("text")
          .attr("class", "bigTitle")
          .attr("x", plotLeft)
          .attr("y", plotTop - 60)
          .text(chartTitle);
    }

    svg.append("text")
        .attr("class","smallTitle")
        .attr("x", plotLeft)
        .attr("y", plotTop - 15)
        .text(modelName);

    // find 5 nice ticks with max and min - do better than d3
    var domain = x.domain();
    var tickValues = d3.ticks(domain[0], domain[1],5);

    switch (tickValues.length){
      case 3:
        tickValues.unshift(domain[0]);
        tickValues.push(domain[1]);
        break;

      case 4:
        if(Math.abs(domain[0] - tickValues[0]) < Math.abs(domain[1] - tickValues[3])){
          tickValues.shift();
          tickValues.unshift(domain[0]);
          tickValues.push(domain[1]);
        } else {
          tickValues.pop();
          tickValues.push(domain[1]);
          tickValues.unshift(domain[0]);
        }
        break;

      case 5:
        tickValues.pop();
        tickValues.shift();
        tickValues.push(domain[1]);
        tickValues.unshift(domain[0]);
        break;

      case 6:
        if(Math.abs(domain[0] - tickValues[0]) < Math.abs(domain[1] - tickValues[3])){
          tickValues.pop();
          tickValues.shift();
          tickValues.shift();
          tickValues.push(domain[1]);
          tickValues.unshift(domain[0]);
        } else {
          tickValues.pop();
          tickValues.pop();
          tickValues.shift();
          tickValues.push(domain[1]);
          tickValues.unshift(domain[0]);
        }
        break;

      case 7:
        tickValues.pop();
        tickValues.pop();
        tickValues.shift();
        tickValues.shift();
        tickValues.push(domain[1]);
        tickValues.unshift(domain[0]);
    }

    // axis and grid
    var xGrid = svg.append("g")
               .attr("class", "grid")
               .attr("transform", "translate(0,"+ (plotTop + plotHeight) + ")")
               .call(d3.axisBottom(x)
                      .ticks(8)
                      .tickSize(-plotHeight)
                      .tickFormat("")
              ).call(g => g.select(".domain").remove());

    var xAxis = d3.axisBottom(x)
              .tickValues(tickValues)
              .tickSizeInner(0)
              .tickPadding(15);

    xAxis = svg.append("g")
              .attr("class", "axisLabel")
              .attr("transform", "translate(0,"+ (plotTop + plotHeight + 8) + ")")
              .call(xAxis);

    var yGrid = svg.append("g")
             .attr("class", "grid")
             .attr("transform", "translate(" + plotLeft + ",0)")
             .call(d3.axisLeft(y)
                    .ticks(8)
                    .tickSize(-(plotWidth-6))
                    .tickFormat("")
            ).call(g => g.select(".domain").remove());

    if (i%2 === 1) {
      var yAxis = d3.axisLeft(y)
              .tickValues(tickValues)
              .tickSizeInner(0)
              .tickPadding(15);

      yAxis = svg.append("g")
              .attr("class", "axisLabel")
              .attr("transform","translate(" + (plotLeft-8) + ",0)")
              .call(yAxis);
    }

    if (background === true){
      // draw grey scatter and smooth
      for (var j=0; j<n; j++){
        if (modelNames[j] !== modelName){
          let tempName = modelNames[j];

          if (points === true) {

            let scatter = svg.selectAll()
                .data(pointData[tempName])
                .enter();

            scatter.append("circle")
                .attr("class", "dot " + tempName)
                .attr("id", tempName)
                .attr("cx", d => x(d.x))
                .attr("cy", d => y(d.y))
                .attr("r", 1)
                .style("fill", greyColor)
                .style("opacity", 0.5);
          }

          if (smooth === true) {

            svg.append("path")
                .data([smoothData[tempName]])
                .attr("class", "smooth " + tempName)
                .attr("id", tempName)
                .attr("d", line)
                .style("fill", "none")
                .style("stroke", greyColor)
                .style("stroke-width", 2)
                .style("opacity", 0.5);
          }
        }
      }
    }

    // scatter
    if (points === true) {
      svg
        .selectAll()
        .data(pointData[modelName])
        .enter()
        .append("circle")
        .attr("class", "dot " + modelName)
        .attr("id", modelName)
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 1)
        .style("fill", pointColor);
    }

    // smooth line
    if (smooth === true) {
      svg.append("path")
        .data([smoothData[modelName]])
        .attr("class", "smooth " + modelName)
        .attr("id", modelName)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", smoothColor)
        .style("stroke-width", 2);
    }

    if (i==n){
    	svg.append("text")
          .attr("class", "axisTitle")
          .attr("transform", "rotate(-90)")
          .attr("y", margin.left - 45 - 8)
          .attr("x", -(margin.top + plotTop + plotHeight)/2)
          .attr("text-anchor", "middle")
          .text(yTitle);

      svg.append("text")
          .attr("class", "axisTitle")
          .attr("y", (plotTop + plotHeight + margin.bottom - 15))
          .attr("x", (margin.left + plotWidth + 25/2))
          .attr("text-anchor", "middle")
          .text(xTitle);
 	  }

    if (i%2 === 1){
      plotLeft += (25 + plotWidth);
    }
    if (i%2 === 0){
      plotLeft -= (25 + plotWidth);
      plotTop += (margin.inner + plotHeight);
    }
}
