var city = "OLM";
var city_strings = ['GYQ','OLM','PICH','VIN'];
var depth_arr = ['year', 'month', 'day', 'hour'];
var dataset_objs,
    sbrst_svg,
    bar_svg,
    sbrst_root,
    curr_root,
    curr_root_objs,
    pathselect,
    curr_click,
    outline;

var color_scale_share;

var outline_timeout_id = null;

var lay_width_map = {
  '0y0': 0,
  '0y1': 0.02,
  '1y0': 0.02,
  '1y1': 0.25,
  '2y0': 0.25,
  '2y1': 0.65,
  '3y0': 0.65,
  '3y1': 1
}

//radial width of center, between 0-1
var CENTER_OFFSET = 0.07;

//radial width of each child layer, between 0-1
var LAYER_WIDTH = 0.31;

//by default only shows rain values, set to true to show all
var SHOW_ALL = false;

var OUTLINE_DEPTH = 2;

var width = window.innerWidth * 0.5,
    height = window.innerHeight * 0.9,
    margin = {top: 80, right: 20, bottom: 80, left: 20},
    radius = (Math.min(width, height - margin.top) / 2) - 10;

sbrst_svg = d3.select('.sunburst-box').append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");
bar_svg = d3.select('.bar-svg-container').append("svg")
    .attr("width", 500)
    .attr("height", 200);
document.querySelector('svg').classList.add('sbrst-svg');
d3.select(self.frameElement).style("height", height + "px");

var twoPi = 2 * Math.PI;

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var y = d3.scaleSqrt()
    .range([0, radius]);

var partition = d3.partition();


function get_start_angle(d) { return Math.max(0, Math.min(twoPi, x(d.x0))); }
function get_end_angle(d) { return Math.max(0, Math.min(twoPi, x(d.x1))); }
function get_inner_radius(d) { return Math.max(0, y(d.y0)); }
function get_outer_radius(d) { return Math.max(0, y(d.y1)); }

var arc = d3.arc()
    .startAngle(get_start_angle)
    .endAngle(get_end_angle)
    .innerRadius(get_inner_radius)
    .outerRadius(get_outer_radius);

var color = d3.scaleLinear().range(color_scales["clrbrw_YlGnBu"]);


//Append a defs (for definition) element to your SVG
var defs = bar_svg.append("defs");

color_scale_share = 100 / 6;

//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient")
    .selectAll("stop") 
    .data( color.range() )                  
    .enter().append("stop")
    .attr("offset", function(d,i) { return i/(color.range().length-1); })
    .attr("stop-color", function(d) { return d; });

function get_outline(root_depth, curr_desc) {
  var curr_desc, freshchild;
  var depth_range = root_depth + OUTLINE_DEPTH;
  if (curr_desc.depth <= depth_range && curr_desc.depth != root_depth) {
    freshchild = {};
    freshchild.x0 = curr_desc.x0;
    freshchild.x1 = curr_desc.x1;
    freshchild.y0 = curr_desc.y0;
    freshchild.y1 = 1.2;
    freshchild.selected = false;
    curr_desc.outline_obj = freshchild;
    outline.push(freshchild);
  }
  else {
    curr_desc.outline_obj = null;
  }
}



function draw_sunburst() {

var max;
var child;
var xrange, yrange;
var descendants;

for (var i in dataset_objs) { if (city_strings[i] == city) { 
  sbrst_root = dataset_objs[i];
  break;
}}
curr_root_objs = dataset_objs;
sbrst_root = d3.hierarchy(sbrst_root);
//either d.timetotal || 1 provides equal spacing
sbrst_root.sum(function(d) { return d.timetotal; });
sbrst_root = partition(sbrst_root);
var outlayers = (1 - sbrst_root.y1) / (sbrst_root.y1 - sbrst_root.y0);
sbrst_root.y0 = 0;
sbrst_root.y1 = CENTER_OFFSET;
var mychild, freshchild;
var deedees = sbrst_root.descendants();
outline = [];

var freshchild;
var depth_range = sbrst_root.depth + OUTLINE_DEPTH;
var toDraw = deedees.filter(function(d) { 
  if (d.depth < 1) { return true;}
  d.y0 = lay_width_map[[d.depth.toString() + 'y0']];
  d.y1 = lay_width_map[[d.depth.toString() + 'y1']];
  get_outline(sbrst_root.depth,d);
  return d.data.isRain;
});
max = sbrst_root.data.rain_stats.max;
//COLOR DOMAIN
color.domain(sbrst_root.data.rain_stats.quantiles);

var grad_start = document.querySelector('.grad-rect-text-start');
grad_start.innerHTML = (sbrst_root.data.rain_stats.quantiles[0].toFixed(2)).toString() + ' mm';
var grad_end = document.querySelector('.grad-rect-text-end');
grad_end.innerHTML = (sbrst_root.data.rain_stats.quantiles[sbrst_root.data.rain_stats.quantiles.length - 1].toFixed(2)).toString() + ' mm';




curr_click = sbrst_root;
pathselect = sbrst_svg.selectAll("path");
pathselect
  .data(toDraw)
  .enter().append("path")
  .attr("class", 'sbrst')
  .attr("d", function (d) {
    return arc(d);
  })
  .style("fill", function draw_sbrst_fill(d) {
    return color((d.data.rain_stats.mean));
  })
  .on("click", sbrst_click)
  .on('mouseover', sbrst_hover_on)
  .on('mouseout', sbrst_hover_off);

draw_info(sbrst_root, dataset_objs);
draw_date(sbrst_root);
// draw_sbrst_outline();


}

function sbrst_click(d) {
  curr_click = d;
  max = d.data.rain_stats.max;
  // d3.select('.chart-box svg').select('*').remove();
  d3.selectAll('.outline').remove();
  outline = [];
  // draw_sbrst_outline();
  sbrst_svg.transition()
    .duration(800)
    .tween("scale", function() {
      var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]),
          yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
      return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
    })
    .selectAll("path")
    .attrTween("d", function(e) {
      get_outline(d.depth,e);
      return function() { 
        return arc(e); 
      }; 
    })
    .style("fill", function(e) {
      if (!e.data) { return;}
      return color((e.data.rain_stats.mean));
    });
  var fresh_roots = all_roots(d, dataset_objs);
  curr_root_objs = fresh_roots;
  draw_info(d, fresh_roots);
  draw_date(d);
  var children_length = fresh_roots[0].children.length;
  if (children_length > 1) {
    var startDateStr = fresh_roots[0].children[0].Day + "/" + fresh_roots[0].children[0].Month + "/" + fresh_roots[0].children[0].Year;
    var endDateStr = fresh_roots[0].children[children_length - 1].Day + "/" + fresh_roots[0].children[children_length - 1].Month + "/" + fresh_roots[0].children[children_length - 1].Year;
    setDateRangeForLines(startDateStr, endDateStr);
  }
}

function sbrst_hover_on(d, tree_roots=dataset_objs) {
  var out_d = d.outline_obj;
  if (!out_d) {return;}
  outline_timeout_id = window.setTimeout(function(){
    hover_info(d,all_roots(d, dataset_objs));
  }, 400);

}

function sbrst_hover_off(d, tree_roots=dataset_objs) {
  var out_d = d.outline_obj;
  if (!out_d) {return;}

  window.clearTimeout(outline_timeout_id);
  hover_clear();
}

function outline_click(d) {
  // console.log(d);
}

function draw_sbrst_outline() {
  pathselect
    .data(outline)
    .enter().append("path")
    .attr("class", 'outline')
    .attr("d", function (d) {
      d.elem = this;
      return arc(d);
    })
    .on('click', outline_click);
}

function draw_gradient() {
  var grad =bar_svg.append('rect')
    .attr('class', 'gradient-rect')
    .style("fill", "url(#linear-gradient)")
    .attr("width", 320)
    .attr('height', 30)
    .attr('x', 55)
    .attr('y',0);
    bar_svg.append('text')
    .attr('x', 0)
    .attr('y', 20)
    .attr('fill', "#fff")
    .attr('class', 'grad-rect-text-start');
    bar_svg.append('text')
    .attr('x', 382)
    .attr('y', 20)
    .attr('fill', "#fff")
    .attr('class', 'grad-rect-text-end');
    bar_svg.append('text')
    .attr('x', 182)
    .attr('y', 45)
    .attr('fill', "#fff")
    .attr('class', 'grad-rect-text-label')
    .text('Mean Rainfall');

}



