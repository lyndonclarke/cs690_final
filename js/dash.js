function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function all_roots(base, root_objs) {
  var parent_l = depth_arr.indexOf(base.level) - 1;
  if (base.parent === null) { return root_objs; }
  var new_roots = [];
  var curr_root, d, j, level_prop;

  for (var i in root_objs) {
    curr_root = root_objs[i];
    d = 1;
    while (curr_root.level != base.data.level) {
      level_prop = toTitleCase(depth_arr[d]);
      j = base.data[[level_prop]] - 1;
      curr_root = curr_root.children[j];
      d++;
      if (d >= depth_arr.length) { break; }
    }
    new_roots[i] = curr_root;
  }
  return new_roots;
}

function load_JSON_objs() {
  startLine();

  d3.json('datasets/gyq_rainfall.json', function(error, gyq_root) { if (error){console.log('error'); throw error;}
  d3.json('datasets/olm_rainfall.json', function(error, olm_root) { if (error){console.log('error'); throw error;}   
  d3.json('datasets/pich_rainfall.json', function(error, pich_root) { if (error){console.log('error'); throw error;}
  d3.json('datasets/vin_rainfall.json', function(error, vin_root) { if (error){console.log('error'); throw error;}
    dataset_objs = [gyq_root,olm_root,pich_root,vin_root];

    var draw_dash = new Promise(function(resolve, reject) {
      draw_gradient();
      draw_sunburst();
      
      resolve();
    });
    
    draw_dash.then(function() {
      set_buttons()
      setup_table();
      set_hover_events();

    });
  });});});});
}

function parse_kids(root) {

}

window.onload = load_JSON_objs();
var chart_city;
