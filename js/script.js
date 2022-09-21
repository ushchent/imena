
const hosts = {"local": "/:8000/", "web": "https://api.opendata.by",
	"test": "https://test.nagrady.by"};
const current_host = hosts["web"];

// Состояние программы в части загрузки данных для отображение на карте
const state = {
    "data": {},
    "markers": null,
};

const test_data = {};

// Управление текстом в строке ввода адреса
const name_field = document.getElementById("autocomplete");

name_field.onfocus = function() {
    if (name_field.value == "Вводите фамилию и выбирайте") {
        name_field.value = "";
    }
}
name_field.onblur = function() {
    if (name_field.value == "") {
        name_field.value = "Вводите фамилию и выбирайте";
    }
};

// Забор списка фамилий по запросу пользователя
function get_name(str) {
    var target = document.getElementById("results_list");
    document.getElementById("message").innerHTML = "";
    if (str.length <= 4 || str == "Вводите фамилию и выбирайте") {
        target.className = "hidden";
    } else {
        fetch(`${current_host}/imena/search/${str}/`)
            .then(response => response.json())
            .then(data => {
                    state.data.search_results = data;
                    create_result_list(data)
                })
    }
}

function list_items_listeners(item, place_holder) {
    var place = document.getElementById(place_holder);
    var items = place.getElementsByTagName(item);
    for (let i = 0; i < items.length; i++) {
        items[i].addEventListener("click", function() {
            const name_selected = this.textContent;
			get_data_by_name(name_selected);
            document.getElementById("autocomplete").value = name_selected;
            document.getElementById("results_list").className = "hidden";
        });
    }
}
function create_result_list(data) {
    const target = document.getElementById("results_list");

    if (target.getElementsByTagName('ul')[0]) {
                    target.getElementsByTagName('ul')[0].remove();
    }
    var list = document.createElement("ul");

    if (data.length == 0) {
        target.className = "hidden";
    } else {
        target.className = "";
    }
    for (var i = 0; i < data.length; i++) {
        var fname_text = document.createTextNode(data[i].fname);
        var list_item = document.createElement("li");
        list_item.appendChild(fname_text);
        list.appendChild(list_item);
    }
    target.appendChild(list);
    list_items_listeners("li", "results_list")
    document.getElementById("results_list")
        .style.border = "1px solid #A5ACB2";
}

function add_markers(name_id) {
	console.log("Adding markers...", name_id);
	console.log(state.data.name_id === undefined);
    state.data.name_id.forEach(d => {
        let popup = d.place;
        let marker = L.marker([d.lat, d.lon], {icon: map_icon})
                .bindPopup(popup);
        state.markers.addLayer(marker);
    })
    mymap.addLayer(state.markers);
}


const manage_layers = test_data => {
	if (heatmapLayer._data.length == 0) {
		console.log("First drawing...");
		heatmapLayer.setData(test_data);
	} else {
		//heatmapLayer.remove();
		heatmapLayer._data = []
		heatmapLayer.setData(test_data);
	}
}

const get_data_by_name = name => {
		console.log(name);
		if (state.data[name] == undefined) {
			console.log("Loading data...")
			fetch(`${current_host}/imena/fname/${name}`)
				.then(response => response.json())
				.then(data => {
					state.data[name] = data;
					test_data["data"] = state.data[name];
					//manage_layers(test_data);
				})
				.then(data => {
					manage_layers(test_data)
					})
		} else {
			console.log("Not loading data...")
			test_data["data"] = state.data[name];
			manage_layers(test_data)
		}
	}

var baseLayer = L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '...',
    maxZoom: 8
  }
);

var cfg = {
  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": 30,
  "maxOpacity": .7,
  // scales the radius based on map zoom
  "scaleRadius": false,
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries
  //   (there will always be a red spot with useLocalExtremas true)
  "useLocalExtrema": false,
  // which field name in your data represents the latitude - default "lat"
  latField: 'lat',
  // which field name in your data represents the longitude - default "lng"
  lngField: 'lon',
  // which field name in your data represents the data value - default "value"
  valueField: 'count'
};


var heatmapLayer = new HeatmapOverlay(cfg);

var map = new L.Map('mapid', {
  center: new L.LatLng(53.893009, 27.567444),
  zoom: 7,
  layers: [baseLayer, heatmapLayer]
});



//function create_marker_cluster_group(name_id) {
    //state.markers = L.markerClusterGroup({
        //showCoverageOnHover: false,
        //iconCreateFunction: function(cluster) {
        //const class_name = name_id + " marker-cluster";
        //return L.divIcon({ html: "<div><span>" + cluster.getChildCount() + "</span></div>",
            //className: class_name });
        //}
    //});
//}

// Добавляем маркеры
//function manage_markers(name_id) {
    //if (state.markers) {
        //state.markers.clearLayers();
        //create_marker_cluster_group(name_id);
        //add_markers(name_id);
    //} else {
        //create_marker_cluster_group(name_id);
        //add_markers(name_id);
    //}
//}

// Карта
//const map_icon = L.icon({
  //iconUrl: 'img/icon.png',
  //iconSize: [29, 24],
  //iconAnchor: [9, 21],
  //popupAnchor: [0, -14]
//});

//const mymap = L.map('mapid', {
                //minZoom: 11,
                //maxZoom: 15
                //})
                //.setView([53.893009, 27.567444], 11);

//L.tileLayer('/tiles/{z}/{x}/{y}.png', {
    //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//}).addTo(mymap);
