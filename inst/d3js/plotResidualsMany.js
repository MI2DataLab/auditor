var points = options.points, smooth = options.smooth;
var minVariable = options.xmin, maxVariable = options.xmax,
    minResidual = options.ymin, maxResidual = options.ymax;
var variableName = options.variable, n = options.n;
var yTitle = options.yTitle, chartTitle = options.chartTitle;
var background = options.background;

var plotHeight, plotWidth;
var margin = {top: 98, right: 30, bottom: 50, left: 60, inner: 70};
var labelsMargin = 94;
var w = width - margin.left - margin.right;
var h = height - margin.top - margin.bottom;
var labelsMargin = margin.left - 6;
var plotTop = margin.top, plotLeft = margin.left;

if (options.scalePlot === true) {
  var m = Math.ceil(n/2);
  if (n == 2) { m = 2; }
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
var pointColor = colors[k];
var smoothColor = colors[0];
var greyColor = colors[2];

residual(data);

svg.selectAll("text")
  .style('font-family', 'Fira Sans, sans-serif');

// plot function
function residual(data){
  var pointData = data[0], smoothData = data[1];
  for (var i=0; i<n; i++){
    var modelName = modelNames[i];
    singlePlot(modelName, pointData, smoothData, i+1);
  }
}

function singlePlot(modelName, pointData, smoothData, i) {

    var x = d3.scaleLinear()
          .range([plotLeft + 10, plotLeft + plotWidth - 10])
          .domain([minVariable, maxVariable]);

    var y = d3.scaleLinear()
          .range([plotTop + plotHeight, plotTop])
          .domain([minResidual, maxResidual]);

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

      svg.append("text")
          .attr("class", "axisTitle")
          .attr("transform", "rotate(-90)")
          .attr("y", 15)
          .attr("x", -(margin.top + 2*plotHeight + margin.inner + margin.bottom)/2)
          .attr("text-anchor", "middle")
          .text(yTitle);
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
    var xAxis = d3.axisBottom(x)
              .tickValues(tickValues)
              .tickSizeInner(0)
              .tickPadding(15);

    xAxis = svg.append("g")
              .attr("class", "axisLabel")
              .attr("transform", "translate(0,"+ (plotTop + plotHeight) + ")")
              .call(xAxis);

    var yGrid = svg.append("g")
             .attr("class", "grid")
             .attr("transform", "translate(" + plotLeft + ",0)")
             .call(d3.axisLeft(y)
                    .ticks(10)
                    .tickSize(-plotWidth)
                    .tickFormat("")
            ).call(g => g.select(".domain").remove());

    if (i%2 === 1) {
      var yAxis = d3.axisLeft(y)
              .ticks(5)
              .tickSize(0);

      yAxis = svg.append("g")
              .attr("class", "axisLabel")
              .attr("transform","translate(" + plotLeft + ",0)")
              .call(yAxis)
              .call(g => g.select(".domain").remove());
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
                .attr("cx", d => x(d.val))
                .attr("cy", d => y(d.res))
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
        .attr("cx", d => x(d.val))
        .attr("cy", d => y(d.res))
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

    if (i%2 === 1){
      plotLeft += (25 + plotWidth);
    }
    if (i%2 === 0){
      plotLeft -= (25 + plotWidth);
      plotTop += (margin.inner + plotHeight);
    }
}
