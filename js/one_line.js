
var line_x = d3.scaleLinear().range([0, bar_width]);
var line_y = d3.scaleLinear().range([bar_height, 0]);

var valueline = d3.line()
    .x(function(d, i) { console.log(d);return line_x(d.data.Day); })
    .y(function(d) { return line_y(d.data.rain_stats.mean); });

function draw_one_line(children_array) {
  console.log(children_array)
  line_y.domain(d3.extent(children_array, function(d) { 
    if (!d.data.rain_stats.mean) {
     d.data.rain_stats.mean = 0; 
   }
     return d.data.rain_stats.mean}));
  line_x.domain([0, 31]);


  bar_svg.append("path")
      .data([children_array])
      .attr("class", "line")

      .attr("d", valueline);


  bar_svg.append("g")
      .attr("transform", "translate(0," + bar_height + ")")

      .call(d3.axisBottom(line_x));


  bar_svg.append("g")

      .call(d3.axisLeft(line_y));



}
