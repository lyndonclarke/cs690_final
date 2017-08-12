var bar_svg;
var bar_x, bar_width;
var bar_y, bar_height;

bar_width = 800,
bar_height = 550;

bar_svg = d3.select(".chart-box").append("svg")
    .attr("width", bar_width + margin.left + margin.right)
    .attr("height", bar_height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

function draw_bars(tree_roots) {
var margin = {top: 60, right: 40, bottom: 40, left: 40};

5
bar_x = d3.scaleBand()
          .range([0, bar_width])
          .padding(0.2);
bar_y = d3.scaleLinear()
          .range([bar_height, 0]);
          
bar_x.domain(tree_roots.map(function(d) { return d.city; }));
bar_y.domain([0, d3.max(dataset_objs.map(function(d) {return d.rain_stats.mean; }))]);
bar_svg.selectAll(".bar")
    .data(tree_roots)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return bar_x(d.city); })
    .attr("width", bar_x.bandwidth())
    .attr("y", function(d) { return bar_y(d.rain_stats.mean); })
    .attr("height", function(d) { return bar_height - bar_y(d.rain_stats.mean); });

bar_svg.append("g")
    .attr("transform", "translate(0," + bar_height + ")")
    .call(d3.axisBottom(bar_x))
    .attr('class', 'axis x_axis')
    .style('fill', 'inherit');

bar_svg.append("g")
    .call(d3.axisLeft(bar_y))
    .attr('class', 'axis y_axis')
    .style('fill', 'inherit');
}

function bar_click(d, tree_roots) {
  bar_svg.selectAll(".bar")
  .data(tree_roots)
  .transition()
    .duration(500)
    .attr("x", function(d) {
      return bar_x(d.city); 
    })
    .attr("width", bar_x.bandwidth())
    .attr("y", function(d) {
      return bar_y(d.rain_stats.mean ? d.rain_stats.mean : 0); 
    })
    .attr("height", function(d) {
      return bar_height - bar_y(d.rain_stats.mean ? d.rain_stats.mean : 0); 
    });
}