var city_name_map = {
  'GYQ' : 'Guayaquil',
  'VIN' : 'Vinces',
  'OLM' : 'Olmedo',
  'PICH' : 'Pichilingue'
}

var default_stats = ['Average', 'Min', 'Max'];


var DECIMAL_PLACE = 5;

var cols_0 = document.querySelectorAll('.col-0');
var cols_1 = document.querySelectorAll('.col-1');
var cols_2 = document.querySelectorAll('.col-2');
var cols_3 = document.querySelectorAll('.col-3');
var col_arr = [cols_0,cols_1,cols_2,cols_3];

var info_date_range= document.querySelector('.date-range'); 
var info_cities = document.querySelectorAll('.info-city');
var info_firsts = document.querySelectorAll('.info-0');
var info_seconds = document.querySelectorAll('.info-1');
var info_thirds = document.querySelectorAll('.info-2');
var info_fourths = document.querySelectorAll('.info-3');
var hover_firsts = document.querySelectorAll('.hover-0');
var hover_seconds = document.querySelectorAll('.hover-1');
var hover_thirds = document.querySelectorAll('.hover-2');
var hover_fourths = document.querySelectorAll('.hover-3');
var info_cols = [info_firsts,info_seconds,info_thirds,info_fourths];
var hover_cols = [hover_firsts,hover_seconds,hover_thirds,hover_fourths];

var select_prop;

var select_heads = document.querySelectorAll('.stat-select-head');
var stat_selects = document.querySelectorAll('.stat-select');
var stat_headers = document.querySelectorAll('.stat-header');
var select_drops = document.querySelectorAll('.dropdown-stat-select');

var city_stats_box_arr = document.querySelectorAll('.city-stats-box');

var gyq_items = document.querySelectorAll('.gyq-item');
var olm_items = document.querySelectorAll('.olm-item');
var pich_items = document.querySelectorAll('.pich-item');
var vin_items = document.querySelectorAll('.vin-item');
var items_arr = [gyq_items,olm_items,pich_items,vin_items];


function draw_info(d, root_objs) {
  var curr_city_ind = city_strings.indexOf(city);
 

    
  for (var i = 0; i < city_strings.length; i++) {
    info_cities[i].innerHTML = city_name_map[[root_objs[i].city]];
    info_firsts[i].innerHTML = get_root_prop(root_objs[i], stat_headers[0].innerHTML);
    info_seconds[i].innerHTML = get_root_prop(root_objs[i], stat_headers[1].innerHTML);
    info_thirds[i].innerHTML = get_root_prop(root_objs[i], stat_headers[2].innerHTML);
    info_fourths[i].innerHTML = get_root_prop(root_objs[i], stat_headers[3].innerHTML);
  }
}

function hover_info(d,hover_roots) {
  for (var i = 0; i < city_strings.length; i++) {
    info_firsts[i].innerHTML = get_root_prop(hover_roots[i], stat_headers[0].innerHTML);
    info_seconds[i].innerHTML = get_root_prop(hover_roots[i], stat_headers[1].innerHTML);
    info_thirds[i].innerHTML = get_root_prop(hover_roots[i], stat_headers[2].innerHTML);
    info_fourths[i].innerHTML = get_root_prop(hover_roots[i], stat_headers[3].innerHTML);
  }
  var curr_child = d.data.children[0];
  var start_date = {
    'year' : curr_child.Year != 0 ? curr_child.Year.toString() : '' ,
    'month': curr_child.Month != 0 ? curr_child.Month.toString() + '/' : '' ,
    'day': curr_child.Day != 0 ? curr_child.Day.toString() +'/': '' ,
    'hour': curr_child.Hour != 0 ? curr_child.Hour.toString() + ':00 ' : ''  
  }
  curr_child = d.data.children[d.data.children.length - 1];
  var end_date = {
    'year' : curr_child.Year != 0 ? curr_child.Year.toString() : '' ,
    'month': curr_child.Month != 0 ? curr_child.Month.toString() + '/' : '' ,
    'day': curr_child.Day != 0 ? curr_child.Day.toString() +'/': '' ,
    'hour': curr_child.Hour != 0 ? curr_child.Hour.toString() + ':00 ' : ''  
  }

  info_date_range.innerHTML = start_date.hour + start_date.month 
    + start_date.day + start_date.year + '  -  ' + end_date.hour + end_date.month 
    + end_date.day + end_date.year;
}

function draw_date(d) {
  var curr_child = curr_click.data.children[0];
  var start_date = {
    'year' : curr_child.Year != 0 ? curr_child.Year.toString() : '' ,
    'month': curr_child.Month != 0 ? curr_child.Month.toString() + '/' : '' ,
    'day': curr_child.Day != 0 ? curr_child.Day.toString() +'/': '' ,
    'hour': curr_child.Hour != 0 ? curr_child.Hour.toString() + ':00 ' : ''  
  }
  curr_child = curr_click.data.children[curr_click.data.children.length - 1];
  var end_date = {
    'year' : curr_child.Year != 0 ? curr_child.Year.toString() : '' ,
    'month': curr_child.Month != 0 ? curr_child.Month.toString() + '/' : '' ,
    'day': curr_child.Day != 0 ? curr_child.Day.toString() +'/': '' ,
    'hour': curr_child.Hour != 0 ? curr_child.Hour.toString() + ':00 ' : ''  
  }

  info_date_range.innerHTML = start_date.hour + start_date.month 
    + start_date.day + start_date.year + '  -  ' + end_date.hour + end_date.month 
    + end_date.day + end_date.year;

}

function hover_clear() {
for (var i = 0; i < city_strings.length; i++) {
  info_firsts[i].innerHTML = get_root_prop(curr_root_objs[i], stat_headers[0].innerHTML);
  info_seconds[i].innerHTML = get_root_prop(curr_root_objs[i], stat_headers[1].innerHTML);
  info_thirds[i].innerHTML = get_root_prop(curr_root_objs[i], stat_headers[2].innerHTML);
  info_fourths[i].innerHTML = get_root_prop(curr_root_objs[i], stat_headers[3].innerHTML);
}

draw_date(curr_click);

}

function get_root_prop(obj, prop_str) {
  var prop_name = prop_str.toLowerCase();
  if (prop_name.startsWith("%")) {
    prop_name = 'ratio';
    var ratioprop = obj.rain_stats[[prop_name]].toFixed(4).split('.')[1];
    return ratioprop.charAt(0) + ratioprop.charAt(1) + '.' + ratioprop.substr(2) + '%';
  }
  if (!obj.rain_stats || !obj.rain_stats[[prop_name]]) { return 0;}
  return parseFloat(obj.rain_stats[[prop_name]].toFixed(4).toString()).toString() + ' mm';
}

function setup_table() {
  for (var curr_head_ind = 0; curr_head_ind < select_heads.length; curr_head_ind++) {
    select_heads[curr_head_ind].addEventListener('click',function() {
      var col_num = parseInt(this.classList[0].slice(-1));
      var curr_col = col_arr[col_num];
      for (var col_i = 0; col_i < curr_col.length; col_i++) {
        curr_col[col_i].classList.toggle('faded-item');
      }
      this.classList.toggle('stat-select-active');

    });
  }
  for (var curr_select_ind = 0; curr_select_ind < stat_selects.length; curr_select_ind++) {
    stat_selects[curr_select_ind].addEventListener('click',function() {
      var curr_header = this.parentElement.parentElement.firstElementChild;
      curr_header.innerHTML = this.innerHTML;
      var col_num = parseInt(curr_header.classList[0].slice(-1));
      var col_arr = info_cols[col_num];
      var curr_col = col_arr[col_num];
      for (var i = 0; i < city_strings.length; i++) {
        var curr_prop = get_root_prop(curr_root_objs[i], this.innerHTML);
        col_arr[i].innerHTML = curr_prop;
      }
      for (var col_i = 0; col_i < curr_col.length; col_i++) {
        curr_col[col_i].classList.toggle('faded-item');
      }
    });
  }
}

function set_buttons() {
  var select_buttons = document.querySelectorAll('.city-button');
  var curr_button;
  for (var select_i = 0; select_i < select_buttons.length; select_i++) {
    select_buttons[select_i].addEventListener('click',function() {
      sbrst_svg.selectAll('*').remove();
      city = this.classList[0].split('-')[0].toUpperCase();
      var curr_active = document.querySelectorAll('.tbl-item');
      for (var active_elem_i = 0; active_elem_i < curr_active.length; active_elem_i++) {
        curr_active[active_elem_i].classList.remove('active-item');
      }
      var active_city_ind = city_strings.indexOf(city);
      var active_elem_arr = items_arr[active_city_ind];

      for (var active_elem_i = 0; active_elem_i < active_elem_arr.length; active_elem_i++) {
        active_elem_arr[active_elem_i].classList.add('active-item');
      }
      fade_lines(city);
      draw_sunburst();
    });
  }
  select_buttons[city_strings.indexOf(city)].click();
}

function set_hover_events() {
  var curr_box;
  for (var box_i = 0; box_i < city_stats_box_arr.length; box_i++) {
    city_stats_box_arr[box_i].addEventListener('mouseover',function() {
      this.classList.toggle('hovered-row');
    });
  }
}

function set_gradient_range() {

}
window.onload = setup_table;



