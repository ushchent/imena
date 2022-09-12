
const hosts = {"local": "/:8000/", "web": "https://api.opendata.by",
	"test": "https://test.nagrady.by"};
const current_host = hosts["local"];

// Состояние программы в части загрузки данных для отображение на карте
const state = {
    "data": {},
    "markers": null,
};

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
                    state.data = data;
                    create_result_list(data)
                })
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
        var address_text = document.createTextNode(data[i].address);
        var list_item = document.createElement("li");
        list_item.appendChild(address_text);
        list.appendChild(list_item);
    }
    target.appendChild(list);
    bezvody_list_items_listeners("li", "results_list")
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

const get_data_by_name_id = (value) => {
		let name_id = value.id;
		console.log(name_id);
		if (state.data.name_id == undefined) {
			console.log("Loading data...")
			fetch(`/data/${name_id}.json`)
				.then(response => response.json())
				.then(data => {
					state.data.name_id = data;
				})
				.then(data => manage_markers(name_id))
		} else {
			console.log("Not loading data...")
			manage_markers(name_id)
		}
	}


function create_marker_cluster_group(name_id) {
    state.markers = L.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: function(cluster) {
        const class_name = name_id + " marker-cluster";
        return L.divIcon({ html: "<div><span>" + cluster.getChildCount() + "</span></div>",
            className: class_name });
        }
    });
}

// Добавляем маркеры
function manage_markers(name_id) {
    if (state.markers) {
        state.markers.clearLayers();
        create_marker_cluster_group(name_id);
        add_markers(name_id);
    } else {
        create_marker_cluster_group(name_id);
        add_markers(name_id);
    }
}

// Карта
const map_icon = L.icon({
  iconUrl: 'img/icon.png',
  iconSize: [29, 24],
  iconAnchor: [9, 21],
  popupAnchor: [0, -14]
});

const mymap = L.map('mapid', {
                minZoom: 11,
                maxZoom: 15
                })
                .setView([53.893009, 27.567444], 11);

L.tileLayer('/tiles/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);
