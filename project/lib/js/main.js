/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * jQuery Geocoding and Places Autocomplete Plugin - V 1.6.5
 *
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2014
 * @author Ubilabs http://ubilabs.net, 2014
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

var map = L.map('map');
var uLat, uLong;
L.tileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
    attribution: 'Groute - Mapquest - OSRM'
}).addTo(map);
if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(showPosition, errorCallback);
} else {
    console.log("Geolocation is not supported by this browser.");
}
function errorCallback(error) {
    
    swal({type: "warning", title: "Location access denied", text: "You did not allow your location to be identified. To begin, click on a desired location on the map to plot your start and end points."});

    init();
}
function showPosition(position) {
    uLat = position.coords.latitude;
    uLong = position.coords.longitude;
    init();
}
function init() {
    $('.leaflet-routing-geocoder').first().focus();

    var control = L.Routing.control({
        waypoints: [
            L.latLng(uLat, uLong)
        ],
        routeWhileDragging: false,
        geocoder: L.Control.Geocoder.nominatim({serviceUrl: 'http://nominatim.openstreetmap.org/'})
    }).addTo(map);
    map.setView(new L.LatLng(1.3147, 103.8471), 12);
    var osmb = new OSMBuildings(map).load();
    L.control.layers({}, {Buildings: osmb}).addTo(map);
    function createButton(label, container) {

        var btn = L.DomUtil.create('button', '', container);
        btn.setAttribute('type', 'button');
        btn.setAttribute('class', "btn blue");
        btn.innerHTML = label;
        return btn;
    }
    $('<button class="btn green upload col-md-12" id="upload">Upload Locations</button>').insertBefore($('.leaflet-routing-geocoders'));
    $('<button class="btn blue pull-left optimize" id="optimize">Optimize</button>').insertBefore($('.leaflet-routing-add-waypoint'));
    $('<button class="btn blue pull-left return" id="return">Return</button>').insertBefore($('.leaflet-routing-add-waypoint'));
    locate();
    $('#upload').click(function() {
        swal({
            title: "Upload Locations",
            text: 'Only CSV files are allowed.<br><div class="input-group"><input type="file" id="uploadCSV"></div>',
            html: true}, function(isConfirm) {
            var file = $("#uploadCSV");
            var ext = file.val().split(".").pop().toLowerCase();
          
            if ($.inArray(ext, ["csv"]) == -1) {
                swal({title: 'Broken csv', text: 'Please upload CSV only', type: "warning"});
                $("#uploadCSV").val('');
                return false;
            }

            if (file[0].files != undefined) {
                var reader = new FileReader();
                var contents = file[0].files[0];
                reader.onload = function(e) {
                   
                    var data = e.target.result;
                    var csvval = data.split("\n");
                    var locations = [];
                    var count=1;

                    var openStreetMapGeocoder = GeocoderJS.createGeocoder('openstreetmap');
                    swal({type: "success", title: "Upload successful!", text: "Estimated time to plot points on map :" + Number(csvval.length) * 500 / 1000});
                    $.each(csvval, function(k, v) {
                        if (v.length == 0) {
                            return
                        }
                        try {
                            openStreetMapGeocoder.geocode(v, function(result) {
                                result = result[0];
                                locations.push(L.latLng(result.latitude, result.longitude));
                                count+=1;
                                setwayPoints(count);

                            });

                        } catch (e) {
                            swal({type: "warning", title: "Malformed address", text: v});
                            return false;
                        }

                    });

                    function setwayPoints(final) {
                        if (final == csvval.length) {
                            control.setWaypoints(locations);
                        }
                    }

                };
                reader.readAsText(contents);

            }

            return false;


        });
    })
    $('#return').click(function() {

        var origin = control.getWaypoints()[0].latLng;

        control.spliceWaypoints(control.getWaypoints().length, 1, origin);
        locate();
    });
    $('#optimize').click(function() {
            
        if (!control.route()) {
            swal({type: "warning", title: "WOOPS", text: "You need at least 4 points to optimised the route."})
            return false;
        }
        var route;
        if (control.route().length > 0) {
            route = control.route()[0];
        }

        var request = {locations: []};
        var waypoints = control.getWaypoints();

        $.each(waypoints, function(k, v) {
            var wp = {latLng: {lat: v.latLng.lat, lng: v.latLng.lng}};
            request.locations.push(wp);
        });
        var q = JSON.stringify(request);
        var distOri = route.summary.totalDistance;
        var timeOri = route.summary.totalTime;
        if (control.route()[0].waypoints.length > 2) {
            var locations = [];
            var date = new Date().getTime();
            $.get('http://open.mapquestapi.com/directions/v2/optimizedroute?key=Fmjtd%7Cluu82q62n1%2Cag%3Do5-94zw0u&json=' + q, function(data) {
                var sameSequence = true;
                $.each(data.route.locationSequence, function(k, v) {
                    if (v != k) {
                        sameSequence = false;
                        return false;
                    }
                });
                if (!sameSequence) {
                    $.each(data.route.locations, function(k, v) {
                        locations.push(L.latLng(v.latLng.lat, v.latLng.lng));
                    });
                    control.setWaypoints(locations);
                    setTimeout(function(){
                    var newDist = control.route()[0].summary.totalDistance;
                    var newTime = control.route()[0].summary.totalTime;
                    swal({type: "success", title: "Optimisation complete", text: "You saved " + Math.abs((Number(newDist)-Number(distOri))/1000).toFixed(2) + " km and " + Math.abs((Number(timeOri) - Number(newTime))/60).toFixed(2) +"hrs"});
                    },1000);
         
                } else {
                    swal({type: "warning", title: "No optimisation required", text: "Your route is the most optimized route already"});
                }
                locate();
            }, 'json');
        } else {
            swal({type: "warning", title: "WOOPS", text: "There are only 2 points. More than 2 points is required before optimisation can be done."});
        }
    });


    function locate() {
           $('.leaflet-routing-geocoder').on('mouseover', function() {
            var index = $(this).index();
            $('.leaflet-marker-pane img:eq(' + index + ')').attr('src', 'lib/img/marker-icon.png');
        }).on('mouseout', function() {
            $('.leaflet-marker-pane img').attr('src', ' http://cdn.leafletjs.com/leaflet-0.7.3/images/marker-icon.png');
        });
    }


    map.on('click', function(e) {

        var container = L.DomUtil.create('div'),
                startBtn = createButton('Start here', container),
                destBtn = createButton('End here', container),
                newDest;

        if (control.route() && control.route()[0].waypoints.length >= 2) {

            newDest = createButton('<i class="fa fa-map-marker"></i>', container);
        }

        L.popup()
                .setContent(container)
                .setLatLng(e.latlng)
                .openOn(map);

        L.DomEvent.on(startBtn, 'click', function() {
            control.spliceWaypoints(0, 1, e.latlng);
            map.closePopup();
            locate();
        });
        if (newDest) {
            L.DomEvent.on(newDest, 'click', function() {
                var lastpt = control.getWaypoints()[control.getWaypoints().length - 1].latLng;
                control.spliceWaypoints(control.getWaypoints().length, 1, lastpt);
                control.spliceWaypoints(control.getWaypoints().length - 2, 1, e.latlng);

                map.closePopup();
                locate();
            });

        }
        L.DomEvent.on(destBtn, 'click', function() {
            control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
            map.closePopup();
            locate();
        });

    });

}












