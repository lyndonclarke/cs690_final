// ;(function() {

// setting the parameters for the chart
var line_margin = {
    top: 30,
    right: 30,
    bottom: 40,
    left: 60
  },
  line_duration = 800,
  line_legend,
  line_zoom,
  transform = 0,
  line_width = window.innerWidth * 0.5 - line_margin.left - line_margin.right, //line_width = 850 - line_margin.left - line_margin.right,
  line_height = 500 - line_margin.top - line_margin.bottom;


var line_data_objs;

var legendSpace,
  hoverLineGroup,
  hoverLine,
  hoverDate,
  columnNames;

var dataCount = [0, 1, 2, 3]; // four cities
// parse the data 
var line_parseDate = d3.timeParse("%d-%b-%y");
var line_timeFormat = d3.timeFormat("%b-%-d");

var line_xScale = d3.scaleTime()
  .range([0, line_width]);

var line_yScale = d3.scaleLinear()
  .range([line_height, 0]);

var line_color = d3.scaleOrdinal()
  .range(['#F44336', '#03A9F4','#FF9800', '#4CAF50'])
  .domain(['GYQ','OLM','PICH','VIN']);

// Define the axes
var line_xAxis = d3.axisBottom(line_xScale).ticks(6);
var line_yAxis = d3.axisLeft(line_yScale);

line_issue = undefined;

// Define the line
var line_line = d3.line()
  .x(function(d) {
    return line_xScale(d.date);
  })
  .y(function(d) {
    return line_yScale(d.rainsum);
  });


//adding the svg canvas
var line_svg = d3.select(".chart-box").append("svg")
  .attr("id", "d3-lines-conatiner")
  .attr("width", line_width + line_margin.left + line_margin.right)
  .attr("height", line_height + line_margin.top + line_margin.bottom)
  .append("g")
  .attr("transform", "translate(" + line_margin.left + "," + line_margin.top + ")");


// loading the data 
function startLine() {
  d3.csv("./datasets/data.csv", function(error, data1) { //blue
    if (error) throw error;
    d3.csv("./datasets/GYQ_rainsum.csv", function(error, data2) { //orange
      if (error) throw error;
      d3.csv("./datasets/OLM.csv", function(error, data3) { //green
        if (error) throw error;
        d3.csv("./datasets/VIN_rainsum.csv", function(error, data4) { //red
          if (error) throw error;
          var dataObj = prepareDataForLineChart(data1, data2, data3, data4)
          line_data_objs = [dataObj.categories[0],dataObj.categories[1],dataObj.categories[2],dataObj.categories[3]];
          console.log(line_data_objs);
          drawLine(dataObj.categories, dataObj.data, dataObj.allData, dataObj.dataCount);
        });
      });
    });
  });
} 

function prepareDataForLineChart(data1, data2, data3, data4) {
  var fullname = [ "Guayaquil", "Olmedo","Pichilingue", "Vinces"];
  var cityName = ['GYQ', 'OLM', 'PICH', 'VIN'];
  

  // an array to hold the data info, such as names..etc
  var categories = [];

  // an array to hold data for the legend - mousemove
  var data = [];

  var data0 = [data1, data2, data3, data4];

  var allData = data1.concat(data2, data3, data4);

  // craate data for line
  dataCount.map(function(n) {
    categories.push({
      name: cityName[n],
      fullname: fullname[n],
      visible: true,
      type: n,
      values: data0[n].map(function(d) {
        return {
          date: line_parseDate(d.date),
          rainsum: +d.rainsum,
        };
      }),
    });
  });

  var i = 0;
  data1.map(function(d) {
    data.push({
      date_1: line_parseDate(d.date), //adding the data
      date_2: line_parseDate(data2[i].date),
      date_3: line_parseDate(data3[i].date),
      date_4: line_parseDate(data4[i].date),
      data_4: data4[i].rainsum,
      data_3: data3[i].rainsum,
      data_2: data2[i].rainsum,
      data_1: d.rainsum
    });
    i = i + 1;
  });

  allData.map(function(d) {
    d.date = line_parseDate(d.date);
  });
  return {
    categories: categories,
    data: data,
    allData: allData,
    dataCount: dataCount
  };
} 


function drawLine(categories, data, allData, dataCount) {
  // setting the date range
  line_xScale.domain(d3.extent(allData, function(d) {
    return d.date;
  }));
  var line_maxY = findMaxY(categories);
  var line_minY = findMinY(categories);

  // shfting the rainsum range on the axis
  line_yScale.domain([line_minY - 1, line_maxY + 1]);


  line_zoom = d3.zoom()
  .scaleExtent([1, 50])
    .on("zoom", zoomed);

  function zoomed() {
    transform = d3.event.transform;
    // console.log(line_xScale.domain());
    var xt = transform.rescaleX(line_xScale);
    // console.log(xt, transform, line_xAxis.scale(xt))
    var line_line = d3.line()
      .x(function(d) {
        return xt(d.date);
      })
      .y(function(d) {
        return line_yScale(d.rainsum);
      });
    line_svg.selectAll(".d3-line-line").attr("d", function(d) {
      return line_line(d.values); // for interactive legend
    });
    line_svg.select("g.x.axis").call(line_xAxis.scale(xt));
  }


  // appened the clip path and hide anything out of bounds
  line_svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", line_width)
    .attr("height", line_height);

  line_svg.append("rect")
    .attr("class", "d3-line-pane")
    .attr("width", line_width)
    .attr("height", line_height)
    .attr("id", "d3-line-mouse-tracker")
    .call(line_zoom);

  line_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + line_height + ")")
    .call(line_xAxis);

  line_svg.append("g")
    .attr("class", "y axis")
    .call(line_yAxis);

  // container for line
  line_issue = line_svg.selectAll(".d3-line-issue")
    .data(categories)
    .enter().append("g")
    .attr("class", "d3-line-issue");

  // plot the line
  line_issue
    .append("path")
    .attr("class", "d3-line-line")
    .style("pointer-events", "none")
    .attr("id", function(d) {
      return "line-" + d.name.replace(" ", "").replace("/", "");
    })
    .attr("d", function(d) {
      return line_line(d.values); // for interactive legend
    })
    .attr("clip-path", "url(#clip)")
    .style("opacity", function(d) {
      return 0.1;
    })
    .style("stroke", function(d) {
      return "#4DB6AC"; //d.visible ? line_color(d.name) : "#F1F1F2";
    });

  // calculating the distance between squares
  legendSpace = line_width / (categories.length);







  // hover line
  hoverLineGroup = line_svg.append("g")
    .attr("class", "d3-line-hover");
  // setting the tracker/line
  hoverLine = hoverLineGroup
    .append("line")
    .attr("id", "d3-line-hover-line")
    .attr("x1", 10).attr("x2", 10)
    .attr("y1", 0).attr("y2", line_height + 10)
    .style("pointer-events", "none") // Stop line interferring with cursor
    .style("opacity", 1e-6); // Set it to zero

  // title - selecting a date for the top right
  hoverDate = hoverLineGroup
    .append('text')
    .attr("id", "d3-line-hover-text")
    .attr("y", line_height - (line_height - 30))
    .attr("x", line_width - 130);

  // get only data name
  columnNames = d3.keys(data[0]).slice(4);



  line_svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + (-45) + "," + (line_height / 2) + ")rotate(90)")
    .style('fill', '#B2DFDB')
    .text("Rainfall data in millimeters");

  // Add mouseover events for hover line
  d3.select("#d3-line-mouse-tracker") // select chart plot #mouse-tracker
    .on("mousemove", function(d) { line_mousemove(d,data, this);})
    .on("mouseout", function() {
      hoverDate
        .append('text') // on mouseout keep the title/date visible
      d3.select("#d3-line-hover-line")
        .style("opacity", 0); // On mouse out keep the tracker visible
    });



} // end of drawLine

function fade_lines(name) {
  d = line_data_objs[city_strings.indexOf(name)];
  d.visible = true;

  var count = 0;
  line_issue.select("path")
    .transition()
    .duration(line_duration)
    .style("opacity", function(d) {
      count = d.visible ? count + 1 : count;
      return d.name == name? 1 : 0.1; //return line_color(d.name);
    });

}


function line_mousemove(d,data,me) {
  var bisectDate = d3.bisector(function(d) {
    return d.date;
  }).left;
  var x0 = line_xScale.invert(d3.mouse(me)[0]),
    i = bisectDate(data, x0, 1),
    d0 = data[i - 1],
    d1 = data[i],
    d = x0 - d0.year > d1.year - x0 ? d1 : d0;

  var mouse_x = d3.mouse(me)[0]; // Finding mouse x position on rect
  // console.log(i, d3.event.pageX, transform, mouse_x)
  var graph_x = line_xScale.invert((1 + mouse_x - (transform.x || 0)) / (transform.k || 1)); //+ 2 * (transform.x || 0)

  var format = line_timeFormat(graph_x);

  // update the title
  hoverDate.text(format);
  d3.select("#d3-line-hover-line")
    .attr("x1", mouse_x)
    .attr("x2", mouse_x)
    .style("opacity", 1);

  // text (value)

}


function setDateRangeForLines(startDateStr, endDateStr) {
  var parser = d3.timeParse("%d/%m/%Y"); //01/01/1986
  var line_parseDate = d3.timeFormat("%d-%b-%y");

  var startDate = parser(startDateStr); //line_parseDate(
  var endDate = parser(endDateStr);
  console.log(line_parseDate(startDate), line_parseDate(endDate));

  line_xScale.domain([startDate, endDate]);
  line_svg.selectAll(".d3-line-line").transition()
    .duration(line_duration).attr("d", function(d) {
      return line_line(d.values); // for interactive legend
    });
  var line_xAxis = d3.axisBottom(line_xScale).ticks(6);
  line_svg.select("g.x.axis").transition()
    .duration(line_duration).call(line_xAxis);
}


// setting and connecting the line with the menu/table. 
// Making one line to be visible at a time
function setOneLineVisible(city) { // calling this function in dash.js
  line_issue.select("path")
    .transition()
    .duration(line_duration)
    .style("opacity", function(d) {
      if (city == d.name) {
        d.visible = true;
        return 1;
      } else {
        d.visible = false;
        return 0.1;
      }
    });
  line_legend.select("rect")
    .transition()
    .duration(line_duration)
    .attr("opacity", function(d) {
      return city == d.name ? 1 : 0.1;
    });
} // end of setOneLineVisible

// calculating the max value for y axis
function findMaxY(data) {
  var maxYValues = data.map(function(d) {
    if (d.visible) {
      return d3.max(d.values, function(value) {
        return value.rainsum;
      })
    }
  });
  return d3.max(maxYValues);
}

// calculate min value for y axis
function findMinY(data) {
  var minYValues = data.map(function(d) {
    if (d.visible) {
      return d3.min(d.values, function(value) {
        return value.rainsum;
      })
    }
  });
  return d3.min(minYValues);
}