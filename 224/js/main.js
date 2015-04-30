/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var LEG = {
    title: "Legend",
    sections: [{
            title: 'MRT',
            className: 'MRT',
            keys: [
                {
                    coordinates: [1.338717, 103.706071, 15],
                    text: "East West Line",
                    thumbnail: './css/images/legend/eastwest.PNG'
                },
                {
                    coordinates: [1.369922, 103.849614, 15],
                    text: "North South Line",
                    thumbnail: './css/images/legend/ns.PNG'
                },
                {
                    coordinates: [1.288751, 103.846837, 15],
                    text: "North East Line",
                    thumbnail: './css/images/legend/ne.PNG'
                },
                {
                    coordinates: [1.342294, 103.880402, 15],
                    text: "Circle line",
                    thumbnail: './css/images/legend/cir.PNG'
                },
                {
                    coordinates: [1.280063, 103.851925, 15],
                    text: "Downtown Line",
                    thumbnail: './css/images/legend/dt.PNG'
                },
                {
                    coordinates: [1.296818, 103.850876, 17],
                    text: "Train Station",
                    thumbnail: './train.svg'
                }

            ]
        },
    {
            title: 'Choropleth ',
            className: 'Population Density  by dwellings',
            keys: [
                {
                  coordinates: [1.3147, 103.8471, 12],
                  text:"",
                    thumbnail: './css/images/legend/pop_dens.PNG'
                }]
},

    {
            title: 'Proportion ',
            className: 'People taking MRT that comes from the subzone',
            keys: [
                {
                  coordinates: [1.3147, 103.8471, 12],
                    text:"",
                    thumbnail: './css/images/legend/mode.PNG'
                }]
}]
}
var map = L.map('map',
        {
            zoomControl: false,
            zoomsliderControl: true,
            attributionControl: false,
            minZoom: 12, 
            maxZoom: 20, 
            legend: LEG, 
            
        });

L.control.pan().addTo(map);
var hash = new L.Hash(map); //add hashes to html address to easy share locations
//     var additional_attrib = 'created with <a href="https://github.com/geolicious/qgis2leaf" target ="_blank">qgis2leaf</a> by <a href="http://www.geolicious.de" target ="_blank">Geolicious</a> & contributors<br>';
var feature_group = new L.featureGroup([]);
var raster_group = new L.LayerGroup([]);
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

var basemap_0 = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
var legend = (new L.Control.TileLegend()).addTo(map)
//, {
//  attribution: additional_attrib + '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'});

var basemap_1 = L.tileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',{legend: LEG})
basemap_1.addTo(map);
map.setView(new L.LatLng(1.3147, 103.8471), 12);
var osmGeocoder = new L.Control.OSMGeocoder({
    collapsed: false,
    text: 'Find!',
});
osmGeocoder.addTo(map);
var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 20});
var miniMap = new L.Control.MiniMap(osm2, {toggleDisplay: true}).addTo(map);
var layerOrder = new Array();
$('.leaflet-control-geocoder').appendTo($('#map')).css({
    'position': 'absolute',
    'left': '10%',
    'top': '10px'
})
function pop_subzonesvy21(feature, layer) {

    var popupContent = '<table><tr><th scope="row">Subzone name</th><td>' + Autolinker.link(String(feature.properties['SUBZONE_N'])) +
            '</td></tr><tr><th scope="row">Planning Area Name</th><td>' + Autolinker.link(String(feature.properties['PLN_AREA_N'])) +
            '</td></tr><tr><th scope="row">Region name</th><td>' + Autolinker.link(String(feature.properties['REGION_N'])) +
            '</td></tr><tr><th scope="row">Total Number of Homes</th><td>' + Autolinker.link(String(feature.properties['pop_density_Total'])) +
            '</td></tr><tr><th scope="row">1-2 Rooms</th><td>' + Autolinker.link(String(feature.properties['pop_density_1_2room'])) +
            '</td></tr><tr><th scope="row">3 Room</th><td>' + Autolinker.link(String(feature.properties['pop_density_3room'])) +
            '</td></tr><tr><th scope="row">4 Rooms</th><td>' + Autolinker.link(String(feature.properties['pop_density_4Room_Flats'])) +
            '</td></tr><tr><th scope="row">5 Rooms and Executive</th><td>' + Autolinker.link(String(feature.properties['pop_density_5RoomandExecutiveFlats'])) +
            '</td></tr><tr><th scope="row">Condomenium and other apartments</th><td>' + Autolinker.link(String(feature.properties['pop_density_Condominiums_and_Other_Apartments'])) +
            '</td></tr><tr><th scope="row">Landed Properties</th><td>' + Autolinker.link(String(feature.properties['pop_density_Landed_Properties'])) +
            '</td></tr><tr><th scope="row">Others</th><td>' + Autolinker.link(String(feature.properties['pop_density_Others'])) + '</td></tr></table>';
    layer.bindPopup(popupContent);
}
function getColor(d) {
    return d > 76600 ? '#b30000' :
            d > 24268 ? '#e34a33' :
            d > 8874 ? '#fc8d59' :
            d > 1098 ? '#fdcc8a' :
            '#fef0d9';
}
var exp_subzonesvy21JSON = new L.geoJson(exp_subzonesvy21, {
    onEachFeature: pop_subzonesvy21,
    style: function(feature) {
        return {fillColor: getColor(feature.properties.pop_density_Total),
            color: '#000',
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.7};
    }
});
feature_group.addLayer(exp_subzonesvy21JSON);
//add comment sign to hide this layer on the map in the initial view.
//exp_subzonesvy21JSON.addTo(map);
function pop_stationssvy21(feature, layer) {

    var popupContent = '<table><tr><th scope="row">Name</th><td>' + Autolinker.link(String(feature.properties['Name'])) + '</td></tr><tr><th scope="row">Adress</th><td>' +
            Autolinker.link(String(feature.properties['Add1'])) + '</td></tr><tr><th scope="row">Latitude</th><td>' + Autolinker.link(String(feature.properties['Latitude'])) + '</td></tr><tr><th scope="row">Longtitude</th><td>' +
            Autolinker.link(String(feature.properties['Longtitude'])) + '</td></tr></table>';
    layer.bindPopup(popupContent);
}

var exp_stationssvy21JSON = new L.geoJson(exp_stationssvy21, {
    onEachFeature: pop_stationssvy21,
    pointToLayer: function(feature, latlng) {
        /**return L.circleMarker(latlng, {
         radius: feature.properties.radius_qgis2leaf,
         fillColor: feature.properties.color_qgis2leaf,
         
         color: feature.properties.borderColor_qgis2leaf,
         weight: 1,
         opacity: feature.properties.transp_qgis2leaf,
         fillOpacity: feature.properties.transp_qgis2leaf
         })
         }**/
        return L.marker(latlng, {icon: L.icon({
                iconUrl: feature.properties.icon,
                iconSize: [24, 24], // size of the icon change this to scale your icon (first coordinate is x, second y from the upper left corner of the icon)
                iconAnchor: [12, 12], // point of the icon which will correspond to marker's location (first coordinate is x, second y from the upper left corner of the icon)
                popupAnchor: [0, -14] // point from which the popup should open relative to the iconAnchor (first coordinate is x, second y from the upper left corner of the icon)
            })
        })
    }
})
feature_group.addLayer(exp_stationssvy21JSON);
//     var cluster_groupstationssvy21JSON = new L.MarkerClusterGroup({showCoverageOnHover: false});
//    cluster_groupstationssvy21JSON.addLayer(exp_stationssvy21JSON);

//add comment sign to hide this layer on the map in the initial view.
exp_stationssvy21JSON.addTo(map);
function pop_RAILSWITHOUTEXTRAS(feature, layer) {

    var popupContent = '<table><tr><th scope="row">osm_id</th><td>' + Autolinker.link(String(feature.properties['osm_id'])) + '</td></tr><tr><th scope="row">name</th><td>' + Autolinker.link(String(feature.properties['name'])) + '</td></tr><tr><th scope="row">type</th><td>' + Autolinker.link(String(feature.properties['type'])) + '</td></tr></table>';
    layer.bindPopup(popupContent);
}

var exp_RAILSWITHOUTEXTRASJSON = new L.geoJson(exp_RAILSWITHOUTEXTRAS, {
    onEachFeature: pop_RAILSWITHOUTEXTRAS,
    style: function(feature) {
        return {weight: feature.properties.radius_qgis2leaf,
            color: feature.properties.color_qgis2leaf,
            opacity: feature.properties.transp_qgis2leaf,
            fillOpacity: feature.properties.transp_qgis2leaf};
    }
});


function pop_mot(feature, layer) {

    var popupContent = '<table><tr><h3>Breakdown for modes of transport</h3></tr><tr><th scope="row">Planning Area</th><td>' + Autolinker.link(String(feature.properties['Planning_A'])) +
            '</td></tr><tr><th scope="row">Total</th><td>' + Autolinker.link(String(feature.properties['Total'])) +
            '</td></tr><tr><th scope="row">Public_Bus</th><td>' + Autolinker.link(String(feature.properties['Public_Bus'])) +
            '</td></tr><tr><th scope="row"><b>Total MRT</b></th><td><b>' + Autolinker.link(String(feature.properties['TotalMRT'])) +
            '</b></td></tr><tr><th scope="row">MRT Only</th><td>' + Autolinker.link(String(feature.properties['MRT_Only'])) +
            '</td></tr><tr><th scope="row">MRT Public</th><td>' +
            Autolinker.link(String(feature.properties['MRT_Public'])) + '</td></tr><tr><th scope="row">MRT & Car</th><td>' +
            Autolinker.link(String(feature.properties['MRT_Car'])) + '</td></tr><tr><th scope="row">MRT & Another</th><td>' +
            Autolinker.link(String(feature.properties['MRT_Anothe'])) + '</td></tr><tr><th scope="row">Taxi Only</th><td>' +
            Autolinker.link(String(feature.properties['Taxi_Only'])) + '</td></tr><tr><th scope="row">Car Only</th><td>' +
            Autolinker.link(String(feature.properties['Car_Only'])) + '</td></tr><tr><th scope="row">Private Car</th><td>' +
            Autolinker.link(String(feature.properties['Private_Ch'])) + '</td></tr><tr><th scope="row">Lorry / Pick</th><td>' +
            Autolinker.link(String(feature.properties['LorryPick'])) + '</td></tr><tr><th scope="row">Motocycle</th><td>' +
            Autolinker.link(String(feature.properties['Motocycle_'])) + '</td></tr><tr><th scope="row">Others</th><td>' +
            Autolinker.link(String(feature.properties['Others'])) + '</td></tr><tr><th scope="row">No Transport</th><td>' +
            Autolinker.link(String(feature.properties['No_Transpo'])) + '</td></tr></table>';
    layer.bindPopup(popupContent);


}
var exp_motJSON = new L.geoJson(exp_mot, {
    onEachFeature: pop_mot,
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: feature.properties.radius_qgis2leaf,
            fillColor: feature.properties.color_qgis2leaf,
            color: feature.properties.borderColor_qgis2leaf,
            weight: 1,
            opacity: feature.properties.transp_qgis2leaf,
            fillOpacity: feature.properties.transp_qgis2leaf
        })
    }
});
feature_group.addLayer(exp_RAILSWITHOUTEXTRASJSON);
var exp_motJSON = new L.geoJson(exp_mot, {
    onEachFeature: pop_mot,
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: feature.properties.radius_qgis2leaf,
            fillColor: feature.properties.color_qgis2leaf,
            color: feature.properties.borderColor_qgis2leaf,
            weight: 1,
            opacity: feature.properties.transp_qgis2leaf,
            fillOpacity: feature.properties.transp_qgis2leaf
        })
    }
});
feature_group.addLayer(exp_motJSON);
//add comment sign to hide this layer on the map in the initial view.
//exp_motJSON.addTo(map);
//add comment sign to hide this layer on the map in the initial view.
exp_RAILSWITHOUTEXTRASJSON.addTo(map);

function pop_modeoftransportvoronoi(feature, layer) {

    var popupContent = '<table><tr><th scope="row">Planning Area</th><td>' + Autolinker.link(String(feature.properties['Planning_A'])) + '</td></tr></table>';
    layer.bindPopup(popupContent);


}

var exp_modeoftransportvoronoiJSON = new L.geoJson(exp_modeoftransportvoronoi, {
    onEachFeature: pop_modeoftransportvoronoi,
    style: function(feature) {
        return {color: feature.properties.border_color_qgis2leaf,
            fillColor: feature.properties.color_qgis2leaf,
            weight: feature.properties.radius_qgis2leaf,
            opacity: 1,
            fillOpacity: 0};
    }
});
feature_group.addLayer(exp_modeoftransportvoronoiJSON);
layerOrder[layerOrder.length] = exp_modeoftransportvoronoiJSON;
//for (index = 0; index < layerOrder.length; index++) {
//    map.removeLayer(layerOrder[index]);
//    map.addLayer(layerOrder[index]);
//}

//add comment sign to hide this layer on the map in the initial view.
//exp_modeoftransportvoronoiJSON.addTo(map);
var title = new L.Control();
title.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    //  this.update();
    return this._div;
};



var baseMaps = {
    'Black/White': basemap_1,
    //'OSM': basemap_0

};


L.control.layers(baseMaps, {"Modes of transport people use": exp_motJSON, "Voronoi demarcation of planning area": exp_modeoftransportvoronoiJSON, "MRT Network": exp_RAILSWITHOUTEXTRASJSON, "MRT Stations": exp_stationssvy21JSON, "Dwellings in subzones": exp_subzonesvy21JSON}, {collapsed: false}).addTo(map);
$('.leaflet-control-layers').appendTo('#map').css({
    'position': 'absolute',
    'left': '10px',
    'top': '375px'
})
$('.leaflet-control-minimap').appendTo('#map').css({
    'position': 'absolute',
    'left': '10px',
    'bottom': '30px'
})
function updateOpacity(value) {
}
map.fitBounds(feature_group.getBounds());
map.on('mouseover', function(e) {
    console.log(e)
})