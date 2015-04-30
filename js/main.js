/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var map;
window.onload = initialize()
function initialize() {
    //setMap()
    var stations=[];
    var stations_filter=[]
    $('tr').each(function(){
        var station_name = $(this).find('td a').first().text()
        var address=$(this).find('td div.search_list div').first().text().split(':')[1]
        stations.push({name:station_name,add:address})
    })
    var count =0
    $.each(stations,function(k,v){
        if(v.add!=null){
            $('#address').append("<tr><td>"+v.name +"</td><td>"+v.add+"</td></tr>")
        }
    })
    
}
function setMap() {

    map = L.map('map').setView([1.355312, 103.827068], 11);
    L.tileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18
    }).addTo(map);
}