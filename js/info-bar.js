
var info_bar_width = window.innerWidth * 0.4;
var info_bar_height = 30;
var gyq_bar_svg = d3.select('.gyq-bar-svg');
var olm_bar_svg = d3.select('.olm-bar-svg');
var pich_bar_svg = d3.select('.pich-bar-svg');
var vin_bar_svg = d3.select('.vin-bar-svg');
var bar_svgs = [gyq_bar_svg,olm_bar_svg,pich_bar_svg,vin_bar_svg];
var curr_root,curr_svg;
for (var root_ind in bar_svgs) {
	curr_svg = bar_svgs[root_ind];
	curr_svg.attr('height', info_bar_height);
	curr_svg.attr('width', info_bar_width);
}
var info_bar_x = d3.scaleLinear().range([0, info_bar_width]).domain([0,1]);
function draw_info_bars(root_objs) {
	console.log('info bars')
	var curr_bar_width;
	for (var root_ind in root_objs) {
		curr_svg = bar_svgs[root_ind];
		curr_root = root_objs[root_ind];
		curr_bar_width = (curr_root.on.length / curr_root.numDesc);
		console.log(curr_bar_width)
		curr_svg
			.append('rect')
			.attr('x',0)
			.attr('width', info_bar_x(curr_bar_width))
			.attr('y',0)
			.attr('height',info_bar_height);

	}
}